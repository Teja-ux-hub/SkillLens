import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import User from "@/models/UserModel";

const cacheSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  data: { type: Object, required: true },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } }
});

const Cache = mongoose.models.Cache || mongoose.model("Cache", cacheSchema);

async function connectDB() {
  await dbConnect();
}

const rateLimits = new Map();

function checkRateLimit(ip, limit = 100, window = 3600000) {
  const now = Date.now();
  const key = `${ip}:${Math.floor(now / window)}`;
  
  const current = rateLimits.get(key) || 0;
  if (current >= limit) {
    return false;
  }
  
  rateLimits.set(key, current + 1);
  
  if (rateLimits.size > 1000) {
    const cutoff = Math.floor(now / window) - 1;
    for (const [k, _] of rateLimits) {
      if (k.split(':')[1] < cutoff) {
        rateLimits.delete(k);
      }
    }
  }
  
  return true;
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN is not defined in environment variables");
}
const BASE_URL = "https://api.github.com";

const githubHeaders = {
  'Authorization': `Bearer ${GITHUB_TOKEN}`,
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'GitHub-Profile-Analyzer'
};

async function getCachedData(key) {
  try {
    await connectDB();
    const cached = await Cache.findOne({ key, expiresAt: { $gt: new Date() } });
    return cached?.data || null;
  } catch (error) {
    return null;
  }
}

async function setCachedData(key, data, ttlMinutes = 60) {
  try {
    await connectDB();
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
    await Cache.findOneAndUpdate(
      { key },
      { data, expiresAt },
      { upsert: true }
    );
  } catch (error) {}
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, { 
        headers: githubHeaders,
        next: { revalidate: 3600 }
      });
      
      if (response.status === 403) {
        const resetTime = response.headers.get('x-ratelimit-reset');
        if (resetTime) {
          const waitTime = (parseInt(resetTime) * 1000) - Date.now();
          if (waitTime > 0 && waitTime < 60000) {
            await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 60000)));
            continue;
          }
        }
        throw new Error('GitHub rate limit exceeded');
      }
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

const fetchGitHubProfile = async (username) => {
  const cacheKey = `profile:${username}`;
  const cached = await getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const profile = await fetchWithRetry(`${BASE_URL}/users/${username}`);
    await setCachedData(cacheKey, profile, 120); 
    return profile;
  } catch (error) {
    return null;
  }
};

const fetchGitHubRepos = async (username) => {
  const cacheKey = `repos:${username}`;
  const cached = await getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const repos = await fetchWithRetry(`${BASE_URL}/users/${username}/repos?per_page=100&sort=updated`);
    await setCachedData(cacheKey, repos, 60); 
    return repos;
  } catch (error) {
    return [];
  }
};

const fetchMultipleRepoLanguages = async (username, repoNames) => {
  const BATCH_SIZE = 10;
  const results = {};
  
  const cachedResults = await Promise.all(
    repoNames.map(async (repoName) => {
      const cacheKey = `langs:${username}:${repoName}`;
      const cached = await getCachedData(cacheKey);
      return { repoName, data: cached };
    })
  );
  
  const toFetch = [];
  cachedResults.forEach(({ repoName, data }) => {
    if (data) {
      results[repoName] = data;
    } else {
      toFetch.push(repoName);
    }
  });
  
  for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
    const batch = toFetch.slice(i, i + BATCH_SIZE);
    
    const batchPromises = batch.map(async (repoName) => {
      try {
        const languages = await fetchWithRetry(`${BASE_URL}/repos/${username}/${repoName}/languages`);
        const cacheKey = `langs:${username}:${repoName}`;
        await setCachedData(cacheKey, languages, 180);
        return { repoName, languages };
      } catch (error) {
        return { repoName, languages: {} };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach(({ repoName, languages }) => {
      results[repoName] = languages;
    });
    
    if (i + BATCH_SIZE < toFetch.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
};

const analyzeWithGemini = async (githubSummary, targetRole) => {
  const cacheKey = `analysis:${githubSummary.u}:${targetRole}`;
  const cached = await getCachedData(cacheKey);
  if (cached) return cached;

  const prompt = `Analyze this GitHub profile for a ${targetRole} role:

Username: ${githubSummary.u}
Repos: ${githubSummary.s.pr} | Followers: ${githubSummary.s.f} | Stars: ${githubSummary.s.stars}
Languages: ${githubSummary.s.langs.join(', ')}
Recent projects: ${githubSummary.s.recent.join(', ')}

Give me ONLY:
1. 3 main issues/pain points in their profile
2. 5 improvement tips

Format as JSON:
{
  "issues": ["issue 1", "issue 2", "issue 3"],
  "tips": ["tip 1", "tip 2", "tip 3", "tip 4", "tip 5"]
}

Be direct and honest. Keep it short.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.candidates[0].content.parts[0].text;
    
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      await setCachedData(cacheKey, analysis, 30);
      return analysis;
    } else {
      throw new Error("Invalid response from Gemini");
    }
    
  } catch (error) {
    throw new Error("Failed to analyze profile");
  }
};

const buildCompactProfileSummary = async (username) => {
  const cacheKey = `summary:${username}`;
  const cached = await getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const [profile, repos] = await Promise.all([
      fetchGitHubProfile(username),
      fetchGitHubRepos(username)
    ]);

    if (!profile) {
      throw new Error("GitHub profile not found");
    }

    const stars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
    const forks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);

    const languageCount = {};
    repos.forEach(repo => {
      if (repo.language) {
        languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
      }
    });

    const topLanguages = Object.entries(languageCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([lang]) => 
        lang === "JavaScript" ? "JS" :
        lang === "Python" ? "Py" :
        lang === "TypeScript" ? "TS" : lang
      );

    const recent = repos
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 3)
      .map(r => r.name);

    const level = stars > 200 ? "High" : stars > 50 ? "Mod" : "Low";

    const topRepos = repos
      .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
      .slice(0, 10);

    const repoLanguages = await fetchMultipleRepoLanguages(username, topRepos.map(r => r.name));

    const detailedRepos = topRepos.map(repo => ({
      n: repo.name,
      l: Object.keys(repoLanguages[repo.name] || {}).map(lang =>
        lang === "JavaScript" ? "JS" :
        lang === "Python" ? "Py" :
        lang === "TypeScript" ? "TS" : lang
      ).slice(0, 3)
    }));

    const summary = {
      u: username,
      s: {
        pr: profile?.public_repos || 0,
        f: profile?.followers || 0,
        stars,
        forks,
        langs: topLanguages,
        lvl: level,
        recent,
      },
      r: detailedRepos
    };

    await setCachedData(cacheKey, summary, 90);

    return summary;
  } catch (error) {
    throw error;
  }
};

const updateUserGitHubSummary = async (userId, githubUsername) => {
  await connectDB();

  const existingUser = await User.findOne({ clerkUserId: userId });
  if (!existingUser) {
    throw new Error("User not found. Please make sure you're logged in.");
  }

  const summary = await buildCompactProfileSummary(githubUsername);
  if (!summary) {
    throw new Error("Failed to generate GitHub summary");
  }

  const updatedUser = await User.findOneAndUpdate(
    { clerkUserId: userId },
    {
      $set: {
        'github.summary': summary,
        'github.username': githubUsername,
        'github.profileUrl': `https://github.com/${githubUsername}`,
        updatedAt: new Date(),
      },
    },
    { new: true }
  );

  return updatedUser;
};

export async function GET(req) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ 
        error: "Rate limit exceeded. Please try again later." 
      }, { status: 429 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const githubUsername = searchParams.get("username");
    const saveToDb = searchParams.get("save") === "true";
    const targetRole = searchParams.get("role");
    const analyze = searchParams.get("analyze") === "true";

    if (!githubUsername) {
      return NextResponse.json({ error: "GitHub username is required" }, { status: 400 });
    }

    if (!/^[a-zA-Z0-9]([a-zA-Z0-9-])*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/.test(githubUsername)) {
      return NextResponse.json({ error: "Invalid GitHub username format" }, { status: 400 });
    }

    let result;
    let analysis = null;
    
    if (saveToDb) {
      const updatedUser = await updateUserGitHubSummary(userId, githubUsername);
      result = updatedUser.github?.summary;
    } else {
      result = await buildCompactProfileSummary(githubUsername);
    }

    if (analyze && targetRole && result) {
      analysis = await analyzeWithGemini(result, targetRole);
    }

    return NextResponse.json({ 
      success: true,
      result,
      analysis,
      message: saveToDb ? "Summary saved to your profile" : "Summary generated"
    }, { status: 200 });

  } catch (err) {
    if (err.message.includes("User not found")) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    
    if (err.message.includes("GitHub profile not found")) {
      return NextResponse.json({ error: "GitHub username not found" }, { status: 404 });
    }

    if (err.message.includes("rate limit")) {
      return NextResponse.json({ 
        error: "GitHub API rate limit reached. Please try again later." 
      }, { status: 429 });
    }

    return NextResponse.json({ 
      error: "Internal Server Error"
    }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ 
        error: "Rate limit exceeded. Please try again later." 
      }, { status: 429 });
    }

    let authData;
    try {
      authData = auth();
      if (authData && typeof authData.then === 'function') {
        authData = await authData;
      }
    } catch (error) {
      authData = await auth();
    }
    
    const { userId } = authData || {};
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const body = await req.json();
    const { targetRole, analyze, forceRefresh } = body;

    await connectDB();

    const user = await User.findOne({ clerkUserId: userId });
    if (!user || !user.github?.username) {
      return NextResponse.json({ 
        error: "User not found or no GitHub username stored" 
      }, { status: 404 });
    }

    if (forceRefresh) {
      const cacheKeys = [
        `summary:${user.github.username}`,
        `profile:${user.github.username}`,
        `repos:${user.github.username}`
      ];
      
      await Promise.all(cacheKeys.map(key => 
        Cache.deleteOne({ key }).catch(() => {})
      ));
    }

    const updatedUser = await updateUserGitHubSummary(userId, user.github.username);
    
    let analysis = null;
    if (analyze && targetRole) {
      analysis = await analyzeWithGemini(updatedUser.github?.summary, targetRole);
    }

    return NextResponse.json({ 
      success: true,
      result: updatedUser.github?.summary,
      analysis,
      message: forceRefresh ? "GitHub summary force refreshed" : "GitHub summary regenerated"
    }, { status: 200 });

  } catch (err) {
    if (err.message.includes("rate limit")) {
      return NextResponse.json({ 
        error: "GitHub API rate limit reached. Please try again later." 
      }, { status: 429 });
    }
    
    return NextResponse.json({ 
      error: "Internal Server Error"
    }, { status: 500 });
  }
}
