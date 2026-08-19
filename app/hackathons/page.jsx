"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Trophy,
  Calendar,
  Award,
  ExternalLink,
  Loader2,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function StudentHackathonsPage() {
  const [hackathons, setHackathons] = useState([]);
  const [filteredHackathons, setFilteredHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchHackathons();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = hackathons.filter(h =>
        h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.organizer.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredHackathons(filtered);
    } else {
      setFilteredHackathons(hackathons);
    }
  }, [searchQuery, hackathons]);

  const fetchHackathons = async () => {
    try {
      const res = await fetch("/api/hackathons");
      const data = await res.json();
      setHackathons(data.hackathons || []);
      setFilteredHackathons(data.hackathons || []);
    } catch (error) {
      console.error("Error fetching hackathons:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysLeft = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  const getUrgencyBadge = (daysLeft) => {
    if (daysLeft <= 3) {
      return <span className="px-3 py-1 rounded-full text-xs bg-red-500/20 text-red-300 border border-red-500/30 font-medium">🔥 {daysLeft} days left</span>;
    } else if (daysLeft <= 7) {
      return <span className="px-3 py-1 rounded-full text-xs bg-orange-500/20 text-orange-300 border border-orange-500/30 font-medium">⚡ {daysLeft} days left</span>;
    } else {
      return <span className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-300 border border-green-500/30 font-medium">✓ {daysLeft} days left</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="h-12 w-12 text-yellow-500" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">Hackathons</h1>
          </div>
          <p className="text-gray-400 text-lg">Participate in exciting hackathons and showcase your skills</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search hackathons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-slate-800/50 border-white/10 text-white text-lg"
            />
          </div>
        </div>

        {/* Hackathons */}
        {filteredHackathons.length === 0 ? (
          <Card className="bg-slate-800/50 border-white/10 p-12 text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {hackathons.length === 0 ? "No Active Hackathons" : "No Results Found"}
            </h3>
            <p className="text-gray-400">
              {hackathons.length === 0 
                ? "Check back later for new hackathon opportunities" 
                : "Try adjusting your search query"}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredHackathons.map((hackathon) => {
              const daysLeft = getDaysLeft(hackathon.registrationDeadline);
              
              return (
                <Card 
                  key={hackathon._id} 
                  className="bg-slate-800/50 border-white/10 p-6 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg">
                        <Trophy className="h-6 w-6 text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1 line-clamp-2">
                          {hackathon.title}
                        </h3>
                        <p className="text-sm text-gray-400">{hackathon.organizer}</p>
                      </div>
                    </div>
                  </div>

                  {/* Urgency Badge */}
                  <div className="mb-4">
                    {getUrgencyBadge(daysLeft)}
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 mb-4 line-clamp-3">{hackathon.description}</p>

                  {/* Info Grid */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="h-4 w-4 text-blue-400" />
                      <span>Registration: <strong className="text-white">{new Date(hackathon.registrationDeadline).toLocaleDateString()}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="h-4 w-4 text-green-400" />
                      <span>Event Date: <strong className="text-white">{new Date(hackathon.eventDate).toLocaleDateString()}</strong></span>
                    </div>
                    {hackathon.prize && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Award className="h-4 w-4 text-yellow-400" />
                        <span className="text-yellow-300 font-semibold">{hackathon.prize}</span>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {hackathon.skills && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {hackathon.skills.split(",").slice(0, 4).map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded border border-blue-500/30">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Eligibility */}
                  {hackathon.eligibility && (
                    <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                      <strong>Eligibility:</strong> {hackathon.eligibility}
                    </p>
                  )}

                  {/* Register Button */}
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                    onClick={() => window.open(hackathon.registrationLink, "_blank")}
                  >
                    Register Now
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
