export const careerRoadmaps = [
  {
    role: "webdeveloper",
    description: "Master full-stack web development from frontend to backend",
    duration: "10 weeks",
    difficulty: "Beginner",
    weeks: [
      {
        week: 1,
        title: "HTML & CSS Fundamentals",
        description: "Learn the building blocks of web development",
        skills: [
          "HTML5 Semantic Elements",
          "CSS3 Styling",
          "Flexbox",
          "Grid Layout",
        ],
        resources: [
          {
            name: "MDN Web Docs - HTML",
            url: "https://developer.mozilla.org/en-US/docs/Web/HTML",
            ytlink: "https://www.youtube.com/watch?v=DYe73Y-FOVg",
          },
          {
            name: "CSS Tricks - Complete Guide",
            url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/",
            ytlink: "https://www.youtube.com/watch?v=GteJWhCikCk",
          },
          {
            name: "freeCodeCamp - Responsive Web Design",
            url: "https://www.freecodecamp.org/learn/responsive-web-design/",
            ytlink: "https://www.youtube.com/watch?v=n4R2E7O-Ngo",
          },
        ],
        milestone: "Build a responsive landing page",
        completed: false,
      },
      {
        week: 2,
        title: "JavaScript Essentials",
        description: "Master core JavaScript programming concepts",
        skills: [
          "Variables & Data Types",
          "Functions & Scope",
          "Arrays & Objects",
          "DOM Manipulation",
        ],
        resources: [
          {
            name: "MDN JavaScript Guide",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
            ytlink: "https://www.youtube.com/watch?v=1Rs2ND1ryYc",
          },
          {
            name: "JavaScript.info",
            url: "https://javascript.info/",
            ytlink: "https://www.youtube.com/watch?v=n4R2E7O-Ngo",
          },
          {
            name: "freeCodeCamp JavaScript",
            url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/",
            ytlink: "https://www.youtube.com/watch?v=PkZNo7MFNFg",
          },
        ],
        milestone: "Build an interactive calculator",
        completed: false,
      },
      {
        week: 3,
        title: "Advanced JavaScript",
        description: "Deep dive into modern JavaScript features",
        skills: [
          "ES6+ Features",
          "Async/Await & Promises",
          "Event Loop",
          "Modules",
        ],
        resources: [
          {
            name: "MDN ES6 Guide",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators",
            ytlink: "https://www.youtube.com/watch?v=Z3iMLb0v0TQ",
          },
          {
            name: "JavaScript.info Async",
            url: "https://javascript.info/async",
            ytlink: "https://www.youtube.com/watch?v=8aGhZQkoFbQ",
          },
        ],
        milestone: "Build a weather app with API",
        completed: false,
      },
      {
        week: 4,
        title: "React Fundamentals",
        description: "Build your first React application",
        skills: [
          "Components & Props",
          "State & Hooks",
          "JSX Syntax",
          "Event Handling",
        ],
        resources: [
          {
            name: "React Official Docs",
            url: "https://react.dev/learn",
            ytlink: "https://www.youtube.com/watch?v=SqcY0GlETPk",
          },
          {
            name: "React Tutorial",
            url: "https://react.dev/learn/tutorial-tic-tac-toe",
            ytlink: "https://www.youtube.com/watch?v=bMknfKXIFA8",
          },
        ],
        milestone: "Build a Todo List app",
        completed: false,
      },
      {
        week: 5,
        title: "React Advanced",
        description: "Master React patterns and state management",
        skills: [
          "Context API",
          "Custom Hooks",
          "useReducer",
          "React Router",
        ],
        resources: [
          {
            name: "React Router Docs",
            url: "https://reactrouter.com/en/main/start/tutorial",
            ytlink: "https://www.youtube.com/watch?v=Ul3NWGwR0fc",
          },
          {
            name: "Advanced React Patterns",
            url: "https://reactpatterns.com/",
            ytlink: "https://www.youtube.com/watch?v=1HCVjyuYp5w",
          },
        ],
        milestone: "Build a multi-page portfolio",
        completed: false,
      },
      {
        week: 6,
        title: "Node.js & Express",
        description: "Build backend APIs with Node.js",
        skills: [
          "Express.js Basics",
          "REST API Design",
          "Middleware",
          "Error Handling",
        ],
        resources: [
          {
            name: "Express.js Guide",
            url: "https://expressjs.com/en/starter/hello-world.html",
            ytlink: "https://www.youtube.com/watch?v=Oe421EPjeBE",
          },
          {
            name: "Node.js Docs",
            url: "https://nodejs.org/en/docs",
            ytlink: "https://www.youtube.com/watch?v=TlB_eWDSF2",
          },
        ],
        milestone: "Build a REST API for blog",
        completed: false,
      },
      {
        week: 7,
        title: "Database Fundamentals",
        description: "Learn database design and integration",
        skills: [
          "MongoDB Basics",
          "Mongoose ORM",
          "CRUD Operations",
          "Database Design",
        ],
        resources: [
          {
            name: "MongoDB University",
            url: "https://university.mongodb.com/",
            ytlink: "https://www.youtube.com/watch?v=ExcRbBXookw",
          },
          {
            name: "Mongoose Docs",
            url: "https://mongoosejs.com/docs/guide.html",
            ytlink: "https://www.youtube.com/watch?v=fIncK4f5Qoc",
          },
        ],
        milestone: "Build full-stack blog app",
        completed: false,
      },
      {
        week: 8,
        title: "Authentication & Deployment",
        description: "Secure your apps and deploy to production",
        skills: [
          "JWT Authentication",
          "Password Hashing",
          "Environment Variables",
          "Vercel/Netlify Deployment",
        ],
        resources: [
          {
            name: "Auth0 React Tutorial",
            url: "https://auth0.com/docs/quickstart/spa/react",
            ytlink: "https://www.youtube.com/watch?v=mbsmsGFH9P4",
          },
          {
            name: "Vercel Deployment",
            url: "https://vercel.com/docs",
            ytlink: "https://www.youtube.com/watch?v=4tWO4JuB1kw",
          },
        ],
        milestone: "Deploy full-stack MERN app",
        completed: false,
      },
      {
        week: 9,
        title: "Advanced Frontend",
        description: "Master modern frontend tooling and optimization",
        skills: [
          "Tailwind CSS",
          "Vite Build Tool",
          "Performance Optimization",
          "Testing with Jest",
        ],
        resources: [
          {
            name: "Tailwind CSS Docs",
            url: "https://tailwindcss.com/docs",
            ytlink: "https://www.youtube.com/watch?v=ft30zcMlFao",
          },
          {
            name: "Vite Documentation",
            url: "https://vitejs.dev/guide/",
            ytlink: "https://www.youtube.com/watch?v=ZgK9p3qJGC8",
          },
        ],
        milestone: "Build performant e-commerce page",
        completed: false,
      },
      {
        week: 10,
        title: "Portfolio & Job Ready",
        description: "Polish your skills and prepare for interviews",
        skills: [
          "Code Review Process",
          "Git Workflow",
          "System Design Basics",
          "Technical Interview Prep",
        ],
        resources: [
          {
            name: "GitHub Guides",
            url: "https://guides.github.com/",
            ytlink: "https://www.youtube.com/watch?v=8Dd7KRpXsoE",
          },
          {
            name: "Frontend Interview Handbook",
            url: "https://frontendinterviewhandbook.com/",
            ytlink: "https://www.youtube.com/watch?v=8urV43U0j8o",
          },
        ],
        milestone: "Deploy professional portfolio website",
        completed: false,
      },
    ],
  },
  {
    role: "ai/mlengineer",
    description: "Build intelligent systems and machine learning models",
    duration: "10 weeks",
    difficulty: "Intermediate",
    weeks: [
      {
        week: 1,
        title: "Python for Data Science",
        description: "Master Python, NumPy, Pandas for ML",
        skills: ["Python Syntax", "Data Structures", "NumPy", "Pandas", "Data Manipulation"],
        resources: [
          {
            name: "Python.org - Official Tutorial",
            url: "https://docs.python.org/3/tutorial/",
            ytlink: "https://www.youtube.com/watch?v=rfscVS0vtbw",
          },
          {
            name: "NumPy Documentation",
            url: "https://numpy.org/doc/stable/user/quickstart.html",
            ytlink: "https://www.youtube.com/watch?v=QUT1VHiLmmI",
          },
          {
            name: "Pandas Tutorial",
            url: "https://pandas.pydata.org/docs/user_guide/10min.html",
            ytlink: "https://www.youtube.com/watch?v=vmEHCJofslg",
          },
        ],
        milestone: "Complete data manipulation exercises",
        completed: false,
      },
      {
        week: 2,
        title: "Statistics & Data Visualization",
        description: "Math foundations + visualization skills",
        skills: ["Statistics", "Matplotlib", "Seaborn", "Exploratory Analysis"],
        resources: [
          {
            name: "Khan Academy - Statistics",
            url: "https://www.khanacademy.org/math/statistics-probability",
            ytlink: "https://www.youtube.com/watch?v=hZxnzfnt5v8",
          },
          {
            name: "Matplotlib Documentation",
            url: "https://matplotlib.org/stable/tutorials/index.html",
            ytlink: "https://www.youtube.com/watch?v=DAQNHzYQIO8",
          },
          {
            name: "Seaborn Tutorial",
            url: "https://seaborn.pydata.org/tutorial.html",
            ytlink: "https://www.youtube.com/watch?v=6GUZXDef2U0",
          },
        ],
        milestone: "Create comprehensive data report",
        completed: false,
      },
      {
        week: 3,
        title: "Supervised Learning Fundamentals",
        description: "Build and evaluate ML models",
        skills: ["Linear/Logistic Regression", "Scikit-learn", "Cross-validation"],
        resources: [
          {
            name: "Scikit-learn User Guide",
            url: "https://scikit-learn.org/stable/user_guide.html",
            ytlink: "https://www.youtube.com/watch?v=pqNCD_5r0IU",
          },
          {
            name: "Kaggle Learn - Intro to ML",
            url: "https://www.kaggle.com/learn/intro-to-machine-learning",
            ytlink: "https://www.youtube.com/watch?v=1r1sue3PMcE",
          },
        ],
        milestone: "Predict house prices and customer churn",
        completed: false,
      },
      {
        week: 4,
        title: "Advanced ML Techniques",
        description: "Model tuning and ensemble methods",
        skills: ["Grid Search", "Random Forest", "XGBoost", "Feature Engineering"],
        resources: [
          {
            name: "Scikit-learn Model Evaluation",
            url: "https://scikit-learn.org/stable/modules/model_evaluation.html",
            ytlink: "https://www.youtube.com/watch?v=85dtiYgA3KA",
          },
          {
            name: "StatQuest - Model Evaluation",
            url: "https://www.youtube.com/watch?v=Kdsp6soqA7o",
            ytlink: "https://www.youtube.com/watch?v=Kdsp6soqA7o",
          },
        ],
        milestone: "Optimize classification model accuracy",
        completed: false,
      },
      {
        week: 5,
        title: "Unsupervised Learning & Clustering",
        description: "Discover patterns in unlabeled data",
        skills: ["K-Means", "PCA", "Clustering Evaluation", "Dimensionality Reduction"],
        resources: [
          {
            name: "Scikit-learn Clustering",
            url: "https://scikit-learn.org/stable/modules/clustering.html",
            ytlink: "https://www.youtube.com/watch?v=_aWzGGNrcic",
          },
          {
            name: "StatQuest - K-Means Clustering",
            url: "https://www.youtube.com/watch?v=4b5d3muPQmA",
            ytlink: "https://www.youtube.com/watch?v=4b5d3muPQmA",
          },
        ],
        milestone: "Customer segmentation analysis",
        completed: false,
      },
      {
        week: 6,
        title: "Deep Learning Fundamentals",
        description: "Neural networks with TensorFlow/Keras",
        skills: ["Neural Networks", "TensorFlow/Keras", "Backpropagation", "MNIST Classification"],
        resources: [
          {
            name: "TensorFlow Official Tutorials",
            url: "https://www.tensorflow.org/tutorials",
            ytlink: "https://www.youtube.com/watch?v=tPYj3fFJGjk",
          },
          {
            name: "3Blue1Brown - Neural Networks",
            url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi",
            ytlink: "https://www.youtube.com/watch?v=IHZwWFHWa-w",
          },
        ],
        milestone: "Train digit recognition model",
        completed: false,
      },
      {
        week: 7,
        title: "Computer Vision & NLP Basics",
        description: "Image classification and text processing",
        skills: ["CNNs", "Image Classification", "Text Preprocessing", "Word Embeddings"],
        resources: [
          {
            name: "Keras Computer Vision Tutorials",
            url: "https://keras.io/examples/vision/",
            ytlink: "https://www.youtube.com/watch?v=PeM-iWVLq94",
          },
          {
            name: "NLTK Book - Natural Language Processing",
            url: "https://www.nltk.org/book/",
            ytlink: "https://www.youtube.com/watch?v=xvqsFTUsOmw",
          },
        ],
        milestone: "Build image classifier + sentiment analyzer",
        completed: false,
      },
      {
        week: 8,
        title: "Model Deployment & MLOps",
        description: "Production-ready ML systems",
        skills: ["Flask API", "Streamlit", "Docker", "Model Serving"],
        resources: [
          {
            name: "Streamlit Documentation",
            url: "https://docs.streamlit.io/",
            ytlink: "https://www.youtube.com/watch?v=ZZ4B0QUHuNc",
          },
          {
            name: "Flask for ML Deployment",
            url: "https://flask.palletsprojects.com/en/2.3.x/tutorial/",
            ytlink: "https://www.youtube.com/watch?v=M226N0yXqMc",
          },
        ],
        milestone: "Deploy ML prediction web app",
        completed: false,
      },
      {
        week: 9,
        title: "Advanced Projects & Portfolio",
        description: "Build production-grade ML applications",
        skills: ["End-to-End ML Pipeline", "Model Monitoring", "A/B Testing", "CI/CD"],
        resources: [
          {
            name: "Kaggle Competitions",
            url: "https://www.kaggle.com/competitions",
            ytlink: "https://www.youtube.com/watch?v=ml1jHQHAOEI",
          },
          {
            name: "MLOps - Machine Learning Engineering",
            url: "https://madewithml.com/courses/mlops/",
            ytlink: "https://www.youtube.com/watch?v=UdZijnF9Usc",
          },
        ],
        milestone: "Complete Kaggle competition submission",
        completed: false,
      },
      {
        week: 10,
        title: "ML Engineer Portfolio & Interview Prep",
        description: "Production-ready portfolio + interview skills",
        skills: ["GitHub Portfolio", "Resume Optimization", "System Design", "Behavioral Interviews"],
        resources: [
          {
            name: "GitHub Portfolio Guide",
            url: "https://docs.github.com/en/get-started",
            ytlink: "https://www.youtube.com/watch?v=8Dd7KRpXsoE",
          },
          {
            name: "ML System Design Interview",
            url: "https://github.com/chiph/awesome-ml-system-design",
            ytlink: "https://www.youtube.com/watch?v=2aqDq7XcSaw",
          },
        ],
        milestone: "Deploy professional ML portfolio website",
        completed: false,
      },
    ],
  },
  {
    role: "datascience",
    description: "Analyze data and build models to extract insights and drive decisions",
    duration: "10 weeks",
    difficulty: "Intermediate",
    weeks: [
      {
        week: 1,
        title: "Python Data Analysis Foundations",
        description: "Master Python, Pandas, NumPy for data work",
        skills: ["Python Basics", "NumPy", "Pandas", "Jupyter Notebooks"],
        resources: [
          {
            name: "Python.org - Data Analysis",
            url: "https://docs.python.org/3/tutorial/",
            ytlink: "https://www.youtube.com/watch?v=rfscVS0vtbw",
          },
          {
            name: "Pandas Documentation",
            url: "https://pandas.pydata.org/docs/user_guide/",
            ytlink: "https://www.youtube.com/watch?v=vmEHCJofslg",
          },
          {
            name: "Kaggle Python Course",
            url: "https://www.kaggle.com/learn/python",
            ytlink: "https://www.youtube.com/watch?v=8DvywoWv6fI",
          },
        ],
        milestone: "Perform EDA on real dataset",
        completed: false,
      },
      {
        week: 2,
        title: "Statistics & Data Visualization",
        description: "Statistical foundations + visualization skills",
        skills: ["Descriptive Stats", "Matplotlib", "Seaborn", "Plotly"],
        resources: [
          {
            name: "Khan Academy - Statistics",
            url: "https://www.khanacademy.org/math/statistics-probability",
            ytlink: "https://www.youtube.com/watch?v=hZxnzfnt5v8",
          },
          {
            name: "Seaborn Tutorial Gallery",
            url: "https://seaborn.pydata.org/examples/index.html",
            ytlink: "https://www.youtube.com/watch?v=6GUZXDef2U0",
          },
          {
            name: "Matplotlib Gallery",
            url: "https://matplotlib.org/stable/gallery/index.html",
            ytlink: "https://www.youtube.com/watch?v=DAQNHzYQIO8",
          },
        ],
        milestone: "Create statistical dashboard",
        completed: false,
      },
      {
        week: 3,
        title: "Data Cleaning & EDA",
        description: "Clean data + comprehensive exploratory analysis",
        skills: ["Data Cleaning", "Outlier Detection", "Correlation Analysis", "Feature Engineering"],
        resources: [
          {
            name: "Kaggle - Data Cleaning",
            url: "https://www.kaggle.com/learn/data-cleaning",
            ytlink: "https://www.youtube.com/watch?v=1Y-c_jimZyI",
          },
          {
            name: "Kaggle EDA Notebooks",
            url: "https://www.kaggle.com/code?search=exploratory+data+analysis",
            ytlink: "https://www.youtube.com/watch?v=_Tb4BK7sJk4",
          },
        ],
        milestone: "Submit complete EDA notebook on Kaggle",
        completed: false,
      },
      {
        week: 4,
        title: "Supervised Machine Learning",
        description: "Build predictive models for business problems",
        skills: ["Linear Regression", "Decision Trees", "Random Forest", "Model Evaluation"],
        resources: [
          {
            name: "Scikit-learn Supervised Learning",
            url: "https://scikit-learn.org/stable/supervised_learning.html",
            ytlink: "https://www.youtube.com/watch?v=pqNCD_5r0IU",
          },
          {
            name: "Kaggle Machine Learning Course",
            url: "https://www.kaggle.com/learn/machine-learning",
            ytlink: "https://www.youtube.com/watch?v=1r1sue3PMcE",
          },
        ],
        milestone: "Predict housing prices + customer churn",
        completed: false,
      },
      {
        week: 5,
        title: "Advanced ML & Model Tuning",
        description: "Optimize models and handle imbalanced data",
        skills: ["Cross-validation", "Hyperparameter Tuning", "Ensemble Methods", "Imbalanced Data"],
        resources: [
          {
            name: "Google ML Crash Course",
            url: "https://developers.google.com/machine-learning/crash-course",
            ytlink: "https://www.youtube.com/watch?v=7eh4d6sabA0",
          },
          {
            name: "Scikit-learn Model Evaluation",
            url: "https://scikit-learn.org/stable/modules/model_evaluation.html",
            ytlink: "https://www.youtube.com/watch?v=85dtiYgA3KA",
          },
        ],
        milestone: "Optimize model performance metrics",
        completed: false,
      },
      {
        week: 6,
        title: "Unsupervised Learning & Clustering",
        description: "Find patterns and segment customers",
        skills: ["K-Means", "PCA", "Clustering Metrics", "Dimensionality Reduction"],
        resources: [
          {
            name: "Scikit-learn Clustering",
            url: "https://scikit-learn.org/stable/modules/clustering.html",
            ytlink: "https://www.youtube.com/watch?v=_aWzGGNrcic",
          },
          {
            name: "StatQuest - Clustering",
            url: "https://www.youtube.com/watch?v=4b5d3muPQmA",
            ytlink: "https://www.youtube.com/watch?v=4b5d3muPQmA",
          },
        ],
        milestone: "Customer segmentation analysis",
        completed: false,
      },
      {
        week: 7,
        title: "Time Series & Forecasting",
        description: "Analyze trends and predict future values",
        skills: ["ARIMA", "Moving Averages", "Seasonality", "Prophet"],
        resources: [
          {
            name: "Kaggle Time Series Course",
            url: "https://www.kaggle.com/learn/time-series",
            ytlink: "https://www.youtube.com/watch?v=1HhOQ6oFVa0",
          },
          {
            name: "Codebasics - Time Series",
            url: "https://www.youtube.com/playlist?list=PLeo1K3hjS3uuKaU2nBDwr6zrSOTzNCs0l",
            ytlink: "https://www.youtube.com/watch?v=5wM6j3uKg8w",
          },
        ],
        milestone: "Stock price forecasting dashboard",
        completed: false,
      },
      {
        week: 8,
        title: "NLP for Data Science",
        description: "Text analysis and sentiment analysis",
        skills: ["Text Preprocessing", "TF-IDF", "Sentiment Analysis", "Topic Modeling"],
        resources: [
          {
            name: "NLTK Book - Processing Raw Text",
            url: "https://www.nltk.org/book/ch03.html",
            ytlink: "https://www.youtube.com/watch?v=xvqsFTUsOmw",
          },
          {
            name: "Kaggle NLP Datasets",
            url: "https://www.kaggle.com/datasets?search=nlp",
            ytlink: "https://www.youtube.com/watch?v=TB3h9J9X7Ng",
          },
        ],
        milestone: "News headline classification",
        completed: false,
      },
      {
        week: 9,
        title: "Business Intelligence & Dashboards",
        description: "Build interactive data applications",
        skills: ["Streamlit", "Plotly Dash", "Data Storytelling", "Executive Reports"],
        resources: [
          {
            name: "Streamlit Documentation",
            url: "https://docs.streamlit.io/library/get-started",
            ytlink: "https://www.youtube.com/watch?v=ZZ4B0QUHuNc",
          },
          {
            name: "Plotly Dash Tutorial",
            url: "https://dash.plotly.com/layout",
            ytlink: "https://www.youtube.com/watch?v=FJKyN3s2k0M",
          },
        ],
        milestone: "Interactive business dashboard",
        completed: false,
      },
      {
        week: 10,
        title: "Capstone & Portfolio Deployment",
        description: "Production-ready data science project",
        skills: ["End-to-End Pipeline", "Model Deployment", "GitHub Portfolio", "Stakeholder Presentation"],
        resources: [
          {
            name: "Flask Mega-Tutorial",
            url: "https://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-i-hello-world",
            ytlink: "https://www.youtube.com/watch?v=Z1RJmh_OqeA",
          },
          {
            name: "Render Deployment Guide",
            url: "https://render.com/docs/deploy-flask",
            ytlink: "https://www.youtube.com/watch?v=4tWO4JuB1kw",
          },
        ],
        milestone: "Deploy complete data science portfolio",
        completed: false,
      },
    ],
  },
  {
    role: "CybersecurityAnalyst",
    description: "Protect systems and data from cyber threats and vulnerabilities",
    duration: "10 weeks",
    difficulty: "Intermediate",
    weeks: [
      {
        week: 1,
        title: "Cybersecurity & Networking Fundamentals",
        description: "Core concepts + network foundations",
        skills: ["CIA Triad", "OSI Model", "TCP/IP", "Threat Modeling"],
        resources: [
          {
            name: "Cybrary Intro Course",
            url: "https://www.cybrary.it/course/introduction-to-it-and-cybersecurity/",
            ytlink: "https://www.youtube.com/watch?v=byK8wG9M9aY",
          },
          {
            name: "Cisco NetAcad",
            url: "https://www.netacad.com/courses/networking/introduction-networks",
            ytlink: "https://www.youtube.com/watch?v=lvB7XQuExJY",
          },
          {
            name: "Professor Messer",
            url: "https://www.professormesser.com/network-plus/",
            ytlink: "https://www.youtube.com/watch?v=vgwLDS5n8LM",
          },
        ],
        milestone: "Create threat model + map home network",
        completed: false,
      },
      {
        week: 2,
        title: "Operating Systems & Linux Security",
        description: "Secure Windows/Linux systems",
        skills: ["Linux Permissions", "Windows Security", "Firewalls", "User Management"],
        resources: [
          {
            name: "OverTheWire",
            url: "https://overthewire.org/wargames/bandit/",
            ytlink: "https://www.youtube.com/watch?v=3n7e3PdnS8I",
          },
          {
            name: "TryHackMe Linux",
            url: "https://tryhackme.com/room/linuxfundamentalspart1",
            ytlink: "https://www.youtube.com/watch?v=pa6M8Z4RAzI",
          },
          {
            name: "Linux Journey",
            url: "https://linuxjourney.com/",
            ytlink: "https://www.youtube.com/watch?v=f0XyN_HmJQA",
          },
        ],
        milestone: "Harden Linux VM with firewall rules",
        completed: false,
      },
      {
        week: 3,
        title: "Cryptography & Web Security",
        description: "Encryption + OWASP Top 10 vulnerabilities",
        skills: ["Encryption", "Hashing", "XSS", "SQL Injection"],
        resources: [
          {
            name: "OWASP Top 10",
            url: "https://owasp.org/www-project-top-ten/",
            ytlink: "https://www.youtube.com/watch?v=m2Z3fI3V3gY",
          },
          {
            name: "Crypto101",
            url: "https://www.crypto101.io/",
            ytlink: "https://www.youtube.com/watch?v=jhXCTbFnK8o",
          },
          {
            name: "PortSwigger Academy",
            url: "https://portswigger.net/web-security",
            ytlink: "https://www.youtube.com/watch?v=0f8lNiP0Qe8",
          },
        ],
        milestone: "Exploit XSS/SQLi in test lab",
        completed: false,
      },
      {
        week: 4,
        title: "Penetration Testing Tools",
        description: "Master Nmap, Metasploit, Burp Suite",
        skills: ["Nmap", "Metasploit", "Burp Suite", "Kali Linux"],
        resources: [
          {
            name: "TryHackMe Beginner Path",
            url: "https://tryhackme.com/path/outline/beginner",
            ytlink: "https://www.youtube.com/watch?v=7x_V22j5Ptc",
          },
          {
            name: "HTB Academy",
            url: "https://academy.hackthebox.com/",
            ytlink: "https://www.youtube.com/watch?v=9V1iF0i7k5M",
          },
          {
            name: "Kali Training",
            url: "https://kali.training/",
            ytlink: "https://www.youtube.com/watch?v=2vpVWEliApc",
          },
        ],
        milestone: "Scan and exploit vulnerable VM",
        completed: false,
      },
      {
        week: 5,
        title: "SIEM & Log Analysis",
        description: "Monitor systems with Splunk/Security Onion",
        skills: ["Splunk", "Log Analysis", "Alerting", "Incident Detection"],
        resources: [
          {
            name: "Splunk Training",
            url: "https://www.splunk.com/en_us/training/",
            ytlink: "https://www.youtube.com/watch?v=0qisGSw5Kpg",
          },
          {
            name: "Security Onion",
            url: "https://docs.securityonion.net/",
            ytlink: "https://www.youtube.com/watch?v=9h7lNNf0s1w",
          },
          {
            name: "Blue Team Labs",
            url: "https://blueteamlabs.online/",
            ytlink: "https://www.youtube.com/watch?v=3rZocGri8p8",
          },
        ],
        milestone: "Create Splunk alerts and dashboards",
        completed: false,
      },
      {
        week: 6,
        title: "Incident Response & Forensics",
        description: "Investigate and respond to security incidents",
        skills: ["Incident Lifecycle", "Forensics", "Memory Analysis", "Report Writing"],
        resources: [
          {
            name: "DFIR Training",
            url: "https://www.dfir.training/",
            ytlink: "https://www.youtube.com/watch?v=6QIVa1N3i4E",
          },
          {
            name: "Autopsy Training",
            url: "https://www.autopsy.com/support/training/",
            ytlink: "https://www.youtube.com/watch?v=7g3Ni6pK0zY",
          },
          {
            name: "SANS DFIR",
            url: "https://www.sans.org/digital-forensics-incident-response/",
            ytlink: "https://www.youtube.com/watch?v=3H2vucNPq8A",
          },
        ],
        milestone: "Document simulated incident response",
        completed: false,
      },
      {
        week: 7,
        title: "Cloud Security Fundamentals",
        description: "Secure AWS/Azure cloud infrastructure",
        skills: ["IAM", "S3 Security", "Cloud Logging", "Compliance"],
        resources: [
          {
            name: "AWS Security Fundamentals",
            url: "https://aws.amazon.com/training/digital/aws-security-fundamentals/",
            ytlink: "https://www.youtube.com/watch?v=3QhU9jd03a0",
          },
          {
            name: "Azure Security",
            url: "https://docs.microsoft.com/en-us/learn/paths/azure-security-technologies/",
            ytlink: "https://www.youtube.com/watch?v=5z7pO7bF7uc",
          },
          {
            name: "Cloud Security Alliance",
            url: "https://cloudsecurityalliance.org/education/",
            ytlink: "https://www.youtube.com/watch?v=9K7mQj8vX4c",
          },
        ],
        milestone: "Secure S3 bucket + configure IAM roles",
        completed: false,
      },
      {
        week: 8,
        title: "Advanced Pentesting & Red Teaming",
        description: "Simulate real-world attacks",
        skills: ["Privilege Escalation", "Lateral Movement", "Persistence", "Evasion"],
        resources: [
          {
            name: "HackTheBox Academy",
            url: "https://academy.hackthebox.com/",
            ytlink: "https://www.youtube.com/watch?v=9V1iF0i7k5M",
          },
          {
            name: "TryHackMe Red Team",
            url: "https://tryhackme.com/path/outline/redteaming",
            ytlink: "https://www.youtube.com/watch?v=2vpVWEliApc",
          },
        ],
        milestone: "Complete full attack chain simulation",
        completed: false,
      },
      {
        week: 9,
        title: "Security Operations Center (SOC) Skills",
        description: "Tier 1-3 SOC analyst capabilities",
        skills: ["Threat Hunting", "IOC Analysis", "TTPs", "Automation"],
        resources: [
          {
            name: "MITRE ATT&CK Framework",
            url: "https://attack.mitre.org/",
            ytlink: "https://www.youtube.com/watch?v=lcvxHggFuJI",
          },
          {
            name: "SOC Prime",
            url: "https://socprime.com/",
            ytlink: "https://www.youtube.com/watch?v=8vP7r5mK3e4",
          },
        ],
        milestone: "Hunt threats using MITRE ATT&CK framework",
        completed: false,
      },
      {
        week: 10,
        title: "Capstone & Professional Portfolio",
        description: "Real-world pentest + SOC portfolio projects",
        skills: ["Pentest Reports", "Portfolio Building", "Cert Prep", "Job Applications"],
        resources: [
          {
            name: "TryHackMe Complete",
            url: "https://tryhackme.com/",
            ytlink: "https://www.youtube.com/watch?v=7x_V22j5Ptc",
          },
          {
            name: "Cybersecurity Career Guide",
            url: "https://www.cyberseek.org/pathway.html",
            ytlink: "https://www.youtube.com/watch?v=2Fok-uzk4lA",
          },
          {
            name: "GitHub Pages Portfolio",
            url: "https://pages.github.com/",
            ytlink: "https://www.youtube.com/watch?v=qaS5A1IA4EI",
          },
        ],
        milestone: "Publish professional cybersecurity portfolio",
        completed: false,
      },
    ],
  },
  {
    role: "MobileAppDeveloper",
    description: "Design and build high-performance mobile applications for Android and iOS",
    duration: "10 weeks",
    difficulty: "Intermediate",
    weeks: [
      {
        week: 1,
        title: "Flutter Setup & Mobile Fundamentals",
        description: "Set up the environment and understand the mobile development workflow",
        skills: [
          "Flutter Setup",
          "Android Studio",
          "Emulator Testing",
          "Mobile App Lifecycle"
        ],
        resources: [
          {
            name: "Flutter Official Documentation",
            url: "https://docs.flutter.dev/get-started/install",
            ytlink: "https://www.youtube.com/watch?v=3kaGC_DrUnw",
          },
          {
            name: "Android Developers Guide",
            url: "https://developer.android.com/guide",
            ytlink: "https://www.youtube.com/watch?v=1ukSR1GRtMU",
          },
          {
            name: "Flutter Installation Guide",
            url: "https://flutter.dev/docs/get-started/install",
            ytlink: "https://www.youtube.com/watch?v=3kaGC_DrUnw",
          },
        ],
        milestone: "Set up Flutter and run Hello World app",
        completed: false,
      },
      {
        week: 2,
        title: "Dart Programming Essentials",
        description: "Learn the Dart language needed for Flutter development",
        skills: [
          "Variables",
          "Functions",
          "OOP in Dart",
          "Collections & Async"
        ],
        resources: [
          {
            name: "Dart Language Tour",
            url: "https://dart.dev/guides/language/language-tour",
            ytlink: "https://www.youtube.com/watch?v=Fqcsow_7go4",
          },
          {
            name: "Dart Programming Tutorial",
            url: "https://dart.dev/tutorials",
            ytlink: "https://www.youtube.com/watch?v=JZukfxvc7Mc",
          },
          {
            name: "freeCodeCamp Dart Course",
            url: "https://www.youtube.com/watch?v=Ej_Pcr4uC2Q",
            ytlink: "https://www.youtube.com/watch?v=Ej_Pcr4uC2Q",
          },
        ],
        milestone: "Create a command-line app in Dart",
        completed: false,
      },
      {
        week: 3,
        title: "Flutter UI & Layouts",
        description: "Build beautiful interfaces using core widgets and layout systems",
        skills: [
          "Stateless vs Stateful Widgets",
          "Row & Column",
          "Container",
          "Text, Images, Buttons"
        ],
        resources: [
          {
            name: "Flutter Widget Catalog",
            url: "https://docs.flutter.dev/development/ui/widgets",
            ytlink: "https://www.youtube.com/watch?v=3kaGC_DrUnw",
          },
          {
            name: "Flutter UI Guide",
            url: "https://docs.flutter.dev/development/ui",
            ytlink: "https://www.youtube.com/watch?v=3kaGC_DrUnw",
          },
          {
            name: "Flutter Layout Cheat Sheet",
            url: "https://medium.com/flutter-community/flutter-layout-cheat-sheet-5363348d037e",
            ytlink: "https://www.youtube.com/watch?v=3kaGC_DrUnw",
          },
        ],
        milestone: "Design a profile card UI",
        completed: false,
      },
      {
        week: 4,
        title: "Navigation & Multi-Screen Apps",
        description: "Manage routes and move between screens effectively",
        skills: [
          "Navigator",
          "Named Routes",
          "Route Arguments",
          "GoRouter Basics"
        ],
        resources: [
          {
            name: "Flutter Navigation and Routing",
            url: "https://docs.flutter.dev/development/ui/navigation",
            ytlink: "https://www.youtube.com/watch?v=nyvwx7o277U",
          },
          {
            name: "Flutter Cookbook - Navigation",
            url: "https://docs.flutter.dev/cookbook/navigation",
            ytlink: "https://www.youtube.com/watch?v=nyvwx7o277U",
          },
          {
            name: "GoRouter Package",
            url: "https://pub.dev/packages/go_router",
            ytlink: "https://www.youtube.com/watch?v=nyvwx7o277U",
          },
        ],
        milestone: "Create a multi-screen quiz app",
        completed: false,
      },
      {
        week: 5,
        title: "State Management",
        description: "Handle app state with scalable Flutter patterns",
        skills: [
          "setState",
          "Provider",
          "Riverpod Basics",
          "State Lifecycle"
        ],
        resources: [
          {
            name: "Flutter State Management Guide",
            url: "https://docs.flutter.dev/development/data-and-backend/state-mgmt",
            ytlink: "https://www.youtube.com/watch?v=mC--7i71Z_A",
          },
          {
            name: "Provider Package",
            url: "https://pub.dev/packages/provider",
            ytlink: "https://www.youtube.com/watch?v=tQ9-VucvqNk",
          },
          {
            name: "Riverpod Documentation",
            url: "https://riverpod.dev/",
            ytlink: "https://www.youtube.com/watch?v=tQ9-VucvqNk",
          },
        ],
        milestone: "Build a todo app using Provider",
        completed: false,
      },
      {
        week: 6,
        title: "Forms, Input & Validation",
        description: "Collect and validate user input in mobile apps",
        skills: [
          "TextField",
          "Form Validation",
          "Controllers",
          "Snackbar"
        ],
        resources: [
          {
            name: "Flutter Forms Documentation",
            url: "https://docs.flutter.dev/cookbook/forms",
            ytlink: "https://www.youtube.com/watch?v=3kaGC_DrUnw",
          },
          {
            name: "Flutter Form Validation",
            url: "https://docs.flutter.dev/cookbook/forms/validation",
            ytlink: "https://www.youtube.com/watch?v=3kaGC_DrUnw",
          },
          {
            name: "Form Builder Package",
            url: "https://pub.dev/packages/flutter_form_builder",
            ytlink: "https://www.youtube.com/watch?v=3kaGC_DrUnw",
          },
        ],
        milestone: "Build login/register UI with validation",
        completed: false,
      },
      {
        week: 7,
        title: "Networking & REST APIs",
        description: "Connect Flutter apps to backend services and APIs",
        skills: [
          "HTTP Package",
          "FutureBuilder",
          "JSON Parsing",
          "REST APIs"
        ],
        resources: [
          {
            name: "Flutter Networking Guide",
            url: "https://docs.flutter.dev/cookbook/networking/fetch-data",
            ytlink: "https://www.youtube.com/watch?v=3kaGC_DrUnw",
          },
          {
            name: "HTTP Package",
            url: "https://pub.dev/packages/http",
            ytlink: "https://www.youtube.com/watch?v=3kaGC_DrUnw",
          },
          {
            name: "Dio Package (Advanced HTTP)",
            url: "https://pub.dev/packages/dio",
            ytlink: "https://www.youtube.com/watch?v=3kaGC_DrUnw",
          },
        ],
        milestone: "Build a weather app using an API",
        completed: false,
      },
      {
        week: 8,
        title: "Firebase Integration",
        description: "Add authentication, database, and backend services",
        skills: [
          "Firebase Auth",
          "Cloud Firestore",
          "Push Notifications",
          "Firebase Setup"
        ],
        resources: [
          {
            name: "FlutterFire Documentation",
            url: "https://firebase.flutter.dev/",
            ytlink: "https://www.youtube.com/watch?v=sfA3NWDBPZ4",
          },
          {
            name: "Firebase Console",
            url: "https://console.firebase.google.com/",
            ytlink: "https://www.youtube.com/watch?v=sfA3NWDBPZ4",
          },
          {
            name: "Firebase Auth Package",
            url: "https://pub.dev/packages/firebase_auth",
            ytlink: "https://www.youtube.com/watch?v=sfA3NWDBPZ4",
          },
        ],
        milestone: "Create a real-time chat app",
        completed: false,
      },
      {
        week: 9,
        title: "Deployment & Store Publishing",
        description: "Prepare, build, sign, and publish Flutter apps",
        skills: [
          "App Bundles",
          "Signing Keys",
          "Play Console",
          "App Store Basics"
        ],
        resources: [
          {
            name: "Flutter Deployment Documentation",
            url: "https://docs.flutter.dev/deployment",
            ytlink: "https://www.youtube.com/watch?v=3kaGC_DrUnw",
          },
          {
            name: "Google Play Console",
            url: "https://play.google.com/console/",
            ytlink: "https://www.youtube.com/watch?v=3kaGC_DrUnw",
          },
          {
            name: "Flutter Build and Release",
            url: "https://docs.flutter.dev/deployment/android",
            ytlink: "https://www.youtube.com/watch?v=3kaGC_DrUnw",
          },
        ],
        milestone: "Publish a test app to Google Play internal track",
        completed: false,
      },
      {
        week: 10,
        title: "Capstone Project",
        description: "Build a complete production-style mobile app",
        skills: [
          "UI/UX Design",
          "Authentication",
          "State Management",
          "API Integration"
        ],
        resources: [
          {
            name: "Flutter Samples",
            url: "https://github.com/flutter/samples",
            ytlink: "https://www.youtube.com/watch?v=3kaGC_DrUnw",
          },
          {
            name: "GitHub for Version Control",
            url: "https://docs.github.com/en/get-started",
            ytlink: "https://www.youtube.com/watch?v=8Dd7KRpXsoE",
          },
          {
            name: "Flutter Gallery App",
            url: "https://github.com/flutter/gallery",
            ytlink: "https://www.youtube.com/watch?v=3kaGC_DrUnw",
          },
        ],
        milestone: "Build and deploy a full mobile app like Expense Tracker or Task Manager",
        completed: false,
      },
    ],
  },

  {
    role: "CloudDevOpsEngineer",
    description: "Design, deploy, and manage cloud infrastructure and automate deployments",
    duration: "10 weeks",
    difficulty: "Advanced",
    weeks: [
      {
        week: 1,
        title: "Cloud Fundamentals & AWS Core",
        description: "Cloud concepts + AWS EC2/S3/IAM basics",
        skills: [
          "IaaS/PaaS/SaaS",
          "EC2",
          "S3",
          "IAM"
        ],
        resources: [
          {
            name: "AWS Cloud Practitioner Essentials",
            url: "https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/",
            ytlink: "https://www.youtube.com/watch?v=3hLmDS179YE",
          },
          {
            name: "AWS Free Tier",
            url: "https://aws.amazon.com/free/",
            ytlink: "https://www.youtube.com/watch?v=3hLmDS179YE",
          },
          {
            name: "AWS Getting Started Documentation",
            url: "https://docs.aws.amazon.com/gettingstarted/",
            ytlink: "https://www.youtube.com/watch?v=3hLmDS179YE",
          },
        ],
        milestone: "Launch EC2 web server + store files in S3",
        completed: false,
      },
      {
        week: 2,
        title: "Linux CLI & Cloud Networking",
        description: "Linux operations + VPC/Load Balancers",
        skills: [
          "Bash/SSH",
          "VPC",
          "Subnets",
          "Security Groups"
        ],
        resources: [
          {
            name: "LinuxCommand.org",
            url: "https://linuxcommand.org/",
            ytlink: "https://www.youtube.com/watch?v=f0XyN_HmJQA",
          },
          {
            name: "AWS VPC Documentation",
            url: "https://docs.aws.amazon.com/vpc/",
            ytlink: "https://www.youtube.com/watch?v=lvB7XQuExJY",
          },
          {
            name: "OverTheWire Bandit",
            url: "https://overthewire.org/wargames/bandit/",
            ytlink: "https://www.youtube.com/watch?v=3n7e3PdnS8I",
          },
        ],
        milestone: "SSH into EC2 + create VPC with load balancer",
        completed: false,
      },
      {
        week: 3,
        title: "Cloud Storage & Databases",
        description: "S3/EBS + managed RDS databases",
        skills: [
          "S3 Buckets",
          "EBS",
          "RDS",
          "Snapshots"
        ],
        resources: [
          {
            name: "AWS RDS Documentation",
            url: "https://docs.aws.amazon.com/rds/",
            ytlink: "https://www.youtube.com/watch?v=3hLmDS179YE",
          },
          {
            name: "AWS S3 User Guide",
            url: "https://docs.aws.amazon.com/s3/",
            ytlink: "https://www.youtube.com/watch?v=3hLmDS179YE",
          },
          {
            name: "DigitalOcean Managed Databases",
            url: "https://www.digitalocean.com/products/managed-databases/",
            ytlink: "https://www.youtube.com/watch?v=3hLmDS179YE",
          },
        ],
        milestone: "Deploy blog app with EC2 + RDS backend",
        completed: false,
      },
      {
        week: 4,
        title: "Docker Containerization",
        description: "Package apps using Docker containers",
        skills: [
          "Dockerfile",
          "Docker Compose",
          "Volumes",
          "Multi-container apps"
        ],
        resources: [
          {
            name: "Docker Official Documentation",
            url: "https://docs.docker.com/",
            ytlink: "https://www.youtube.com/watch?v=3c-iBn73dDE",
          },
          {
            name: "Play With Docker",
            url: "https://labs.play-with-docker.com/",
            ytlink: "https://www.youtube.com/watch?v=3c-iBn73dDE",
          },
          {
            name: "Docker Compose Documentation",
            url: "https://docs.docker.com/compose/",
            ytlink: "https://www.youtube.com/watch?v=3c-iBn73dDE",
          },
        ],
        milestone: "Containerize Node.js/Flask app with Docker Compose",
        completed: false,
      },
      {
        week: 5,
        title: "Kubernetes Orchestration",
        description: "Deploy and scale containers with Kubernetes",
        skills: [
          "Pods",
          "Deployments",
          "Services",
          "Helm"
        ],
        resources: [
          {
            name: "Kubernetes Official Documentation",
            url: "https://kubernetes.io/docs/",
            ytlink: "https://www.youtube.com/watch?v=X48VuDVv0do",
          },
          {
            name: "Kubernetes Interactive Tutorials",
            url: "https://kubernetes.io/docs/tutorials/",
            ytlink: "https://www.youtube.com/watch?v=X48VuDVv0do",
          },
          {
            name: "Helm Documentation",
            url: "https://helm.sh/docs/",
            ytlink: "https://www.youtube.com/watch?v=X48VuDVv0do",
          },
        ],
        milestone: "Deploy multi-container app on Minikube/EKS",
        completed: false,
      },
      {
        week: 6,
        title: "CI/CD Pipelines",
        description: "Automate build/test/deploy workflows",
        skills: [
          "GitHub Actions",
          "Jenkins",
          "GitLab CI/CD",
          "Pipeline YAML"
        ],
        resources: [
          {
            name: "GitHub Actions Documentation",
            url: "https://docs.github.com/en/actions",
            ytlink: "https://www.youtube.com/watch?v=j5Zsa_eOXeY",
          },
          {
            name: "Jenkins Documentation",
            url: "https://www.jenkins.io/doc/",
            ytlink: "https://www.youtube.com/watch?v=j5Zsa_eOXeY",
          },
          {
            name: "GitLab CI/CD Documentation",
            url: "https://docs.gitlab.com/ee/ci/",
            ytlink: "https://www.youtube.com/watch?v=j5Zsa_eOXeY",
          },
        ],
        milestone: "Build/deploy Docker app via GitHub Actions",
        completed: false,
      },
      {
        week: 7,
        title: "Infrastructure as Code (IaC)",
        description: "Manage cloud resources programmatically",
        skills: [
          "Terraform",
          "AWS CDK",
          "CloudFormation",
          "State Management"
        ],
        resources: [
          {
            name: "Terraform Documentation",
            url: "https://www.terraform.io/docs",
            ytlink: "https://www.youtube.com/watch?v=SLB_c_ayRMo",
          },
          {
            name: "HashiCorp Learn Terraform",
            url: "https://learn.hashicorp.com/terraform",
            ytlink: "https://www.youtube.com/watch?v=SLB_c_ayRMo",
          },
          {
            name: "AWS CloudFormation Documentation",
            url: "https://docs.aws.amazon.com/cloudformation/",
            ytlink: "https://www.youtube.com/watch?v=SLB_c_ayRMo",
          },
        ],
        milestone: "Provision AWS infrastructure using Terraform",
        completed: false,
      },
      {
        week: 8,
        title: "Monitoring & Logging",
        description: "Observe and troubleshoot cloud applications",
        skills: [
          "CloudWatch",
          "Grafana",
          "Prometheus",
          "ELK Stack"
        ],
        resources: [
          {
            name: "AWS CloudWatch Documentation",
            url: "https://docs.aws.amazon.com/cloudwatch/",
            ytlink: "https://www.youtube.com/watch?v=3hLmDS179YE",
          },
          {
            name: "Grafana Documentation",
            url: "https://grafana.com/docs/",
            ytlink: "https://www.youtube.com/watch?v=SKgNBsAja8E",
          },
          {
            name: "Prometheus Documentation",
            url: "https://prometheus.io/docs/",
            ytlink: "https://www.youtube.com/watch?v=SKgNBsAja8E",
          },
        ],
        milestone: "Set up monitoring dashboard for cloud app",
        completed: false,
      },
      {
        week: 9,
        title: "Multi-Cloud & Advanced Services",
        description: "Work across AWS/Azure/GCP + serverless",
        skills: [
          "Azure Fundamentals",
          "GCP Services",
          "Lambda/Fargate",
          "Cloud Cost Management"
        ],
        resources: [
          {
            name: "Microsoft Learn - Azure Fundamentals",
            url: "https://docs.microsoft.com/en-us/learn/paths/az-900-describe-cloud-concepts/",
            ytlink: "https://www.youtube.com/watch?v=3hLmDS179YE",
          },
          {
            name: "Google Cloud Fundamentals",
            url: "https://www.cloudskillsboost.google/course_templates/60",
            ytlink: "https://www.youtube.com/watch?v=3hLmDS179YE",
          },
        ],
        milestone: "Deploy serverless app on Lambda",
        completed: false,
      },
      {
        week: 10,
        title: "Capstone Production Deployment",
        description: "Complete full-stack cloud deployment pipeline",
        skills: [
          "Complete CI/CD + IaC",
          "Production Monitoring",
          "Disaster Recovery",
          "Portfolio Project"
        ],
        resources: [
          {
            name: "freeCodeCamp DevOps Course",
            url: "https://www.youtube.com/watch?v=j5Zsa_eOXeY",
            ytlink: "https://www.youtube.com/watch?v=j5Zsa_eOXeY",
          },
          {
            name: "DigitalOcean Tutorials",
            url: "https://www.digitalocean.com/community/tutorials",
            ytlink: "https://www.youtube.com/watch?v=j5Zsa_eOXeY",
          },
        ],
        milestone: "Deploy containerized app with full CI/CD, IaC, and monitoring",
        completed: false,
      },
    ],
  },
  {
    role: "GameDeveloper",
    description: "Design and build interactive games using game engines and programming logic",
    duration: "10 weeks",
    difficulty: "Intermediate",
    weeks: [
      {
        week: 1,
        title: "Game Development Basics",
        description: "Understand game genres, loops, engines, and the overall game creation pipeline",
        skills: [
          "Game Genres",
          "Game Loop Concept",
          "Game Engines Overview"
        ],
        resources: [
          {
            name: "GDC Vault",
            url: "https://www.gdcvault.com/",
            ytlink: "https://www.youtube.com/watch?v=XtQMytORBmM",
          },
          {
            name: "GameDev.tv Blog",
            url: "https://www.gamedev.tv/blog",
            ytlink: "https://www.youtube.com/watch?v=XtQMytORBmM",
          },
          {
            name: "Coursera Game Design and Development",
            url: "https://www.coursera.org/specializations/game-development",
            ytlink: "https://www.youtube.com/watch?v=XtQMytORBmM",
          },
          {
            name: "Extra Credits Game Design",
            url: "https://www.youtube.com/extracredits",
            ytlink: "https://www.youtube.com/watch?v=XtQMytORBmM",
          },
        ],
        milestone: "Explore Unity interface and build a basic 2D scene",
        completed: false,
      },
      {
        week: 2,
        title: "C# for Unity",
        description: "Learn the C# fundamentals used for game scripting in Unity",
        skills: [
          "Variables & Data Types",
          "Conditionals",
          "Loops",
          "Classes & Methods"
        ],
        resources: [
          {
            name: "Microsoft C# Documentation",
            url: "https://docs.microsoft.com/en-us/dotnet/csharp/",
            ytlink: "https://www.youtube.com/watch?v=IFayQioG71A",
          },
          {
            name: "Brackeys C# Basics",
            url: "https://www.youtube.com/watch?v=IFayQioG71A",
            ytlink: "https://www.youtube.com/watch?v=IFayQioG71A",
          },
          {
            name: "Unity Learn C# Scripting",
            url: "https://learn.unity.com/tutorial/introduction-to-c-sharp-scripting",
            ytlink: "https://www.youtube.com/watch?v=qeIWctjeY0c",
          },
          {
            name: "C# Programming Yellow Book",
            url: "https://www.robmiles.com/c-yellow-book/",
            ytlink: "https://www.youtube.com/watch?v=IFayQioG71A",
          },
        ],
        milestone: "Build a basic console game like number guesser",
        completed: false,
      },
      {
        week: 3,
        title: "Unity Engine Basics",
        description: "Learn scenes, game objects, components, and the inspector in Unity",
        skills: [
          "Scenes",
          "GameObjects",
          "Components",
          "Inspector"
        ],
        resources: [
          {
            name: "Unity Learn Pathways",
            url: "https://learn.unity.com/",
            ytlink: "https://www.youtube.com/watch?v=j48LtUkZRjU",
          },
          {
            name: "Brackeys Unity Beginner Tutorial",
            url: "https://www.youtube.com/watch?v=j48LtUkZRjU",
            ytlink: "https://www.youtube.com/watch?v=j48LtUkZRjU",
          },
          {
            name: "Unity Manual",
            url: "https://docs.unity3d.com/Manual/",
            ytlink: "https://www.youtube.com/watch?v=gB1F9G0JXOo",
          },
          {
            name: "Unity Scripting Reference",
            url: "https://docs.unity3d.com/ScriptReference/",
            ytlink: "https://www.youtube.com/watch?v=gB1F9G0JXOo",
          },
        ],
        milestone: "Create a 2D platformer scene with character and terrain",
        completed: false,
      },
      {
        week: 4,
        title: "Player Controls & Physics",
        description: "Add input handling, character movement, and rigidbody-based interactions",
        skills: [
          "Input Handling",
          "Character Movement",
          "Physics",
          "Rigidbodies"
        ],
        resources: [
          {
            name: "Unity Input System Documentation",
            url: "https://docs.unity3d.com/Packages/com.unity.inputsystem@1.0/manual/",
            ytlink: "https://www.youtube.com/watch?v=4HpC--2iowE",
          },
          {
            name: "Code Monkey Unity Tutorials",
            url: "https://www.youtube.com/c/CodeMonkeyUnity",
            ytlink: "https://www.youtube.com/watch?v=AmGSEH7QcDg",
          },
          {
            name: "Brackeys Player Movement",
            url: "https://www.youtube.com/watch?v=4HpC--2iowE",
            ytlink: "https://www.youtube.com/watch?v=4HpC--2iowE",
          },
          {
            name: "Unity Physics Documentation",
            url: "https://docs.unity3d.com/Manual/PhysicsSection.html",
            ytlink: "https://www.youtube.com/watch?v=4HpC--2iowE",
          },
        ],
        milestone: "Add jump and move features to your character",
        completed: false,
      },
      {
        week: 5,
        title: "Collisions & Core Mechanics",
        description: "Implement collisions, triggers, obstacles, and simple win/lose rules",
        skills: [
          "Colliders",
          "Triggers",
          "Gravity",
          "Force Application"
        ],
        resources: [
          {
            name: "Unity Physics Documentation",
            url: "https://docs.unity3d.com/Manual/PhysicsSection.html",
            ytlink: "https://www.youtube.com/watch?v=whzomFgjT50",
          },
          {
            name: "Unity Colliders Tutorial",
            url: "https://learn.unity.com/tutorial/collision-detection-with-colliders",
            ytlink: "https://www.youtube.com/watch?v=whzomFgjT50",
          },
          {
            name: "Raycasting in Unity",
            url: "https://docs.unity3d.com/ScriptReference/Physics.Raycast.html",
            ytlink: "https://www.youtube.com/watch?v=whzomFgjT50",
          },
          {
            name: "Brackeys 2D Physics",
            url: "https://www.youtube.com/watch?v=whzomFgjT50",
            ytlink: "https://www.youtube.com/watch?v=whzomFgjT50",
          },
        ],
        milestone: "Create obstacles and win/lose conditions using physics",
        completed: false,
      },
      {
        week: 6,
        title: "UI, Health & Scoring",
        description: "Create menus, score systems, health bars, and game over flow",
        skills: [
          "Canvas System",
          "Health Bar",
          "Score Counter",
          "Menus"
        ],
        resources: [
          {
            name: "Unity UI Toolkit Documentation",
            url: "https://docs.unity3d.com/Manual/UIElements.html",
            ytlink: "https://www.youtube.com/watch?v=BLfNP4Sc_iA",
          },
          {
            name: "Unity UI System (Legacy)",
            url: "https://docs.unity3d.com/Manual/UISystem.html",
            ytlink: "https://www.youtube.com/watch?v=BLfNP4Sc_iA",
          },
          {
            name: "Brackeys Health System Tutorial",
            url: "https://www.youtube.com/watch?v=BLfNP4Sc_iA",
            ytlink: "https://www.youtube.com/watch?v=BLfNP4Sc_iA",
          },
          {
            name: "GameDev.tv Complete Unity Developer",
            url: "https://www.gamedev.tv/p/complete-unity-developer",
            ytlink: "https://www.youtube.com/watch?v=AmGSEH7QcDg",
          },
        ],
        milestone: "Add score counter and health bar with game over screen",
        completed: false,
      },
      {
        week: 7,
        title: "Animation & Audio",
        description: "Make the game feel alive with animations, transitions, and sound effects",
        skills: [
          "Animator Controller",
          "Transitions",
          "2D/3D Animation",
          "Sound Effects"
        ],
        resources: [
          {
            name: "Unity Animation System",
            url: "https://docs.unity3d.com/Manual/AnimationSection.html",
            ytlink: "https://www.youtube.com/watch?v=gB1F9G0JXOo",
          },
          {
            name: "Mixamo for 3D Animations",
            url: "https://www.mixamo.com/",
            ytlink: "https://www.youtube.com/watch?v=gB1F9G0JXOo",
          },
          {
            name: "OpenGameArt.org",
            url: "https://opengameart.org/",
            ytlink: "https://www.youtube.com/watch?v=gB1F9G0JXOo",
          },
          {
            name: "Unity Audio Documentation",
            url: "https://docs.unity3d.com/Manual/AudioFiles.html",
            ytlink: "https://www.youtube.com/watch?v=gB1F9G0JXOo",
          },
        ],
        milestone: "Animate player actions and add sound effects",
        completed: false,
      },
      {
        week: 8,
        title: "Level Design & AI",
        description: "Design playable levels and add enemy behavior and reusable systems",
        skills: [
          "Tilemaps",
          "Object Pooling",
          "Power-ups",
          "AI Enemies"
        ],
        resources: [
          {
            name: "Unity 2D Tilemap Documentation",
            url: "https://docs.unity3d.com/Manual/class-Tilemap.html",
            ytlink: "https://www.youtube.com/watch?v=6BrZryMz-ac",
          },
          {
            name: "Unity Object Pooling",
            url: "https://learn.unity.com/tutorial/object-pooling",
            ytlink: "https://www.youtube.com/watch?v=6BrZryMz-ac",
          },
          {
            name: "Game Programming Patterns",
            url: "https://gameprogrammingpatterns.com/",
            ytlink: "https://www.youtube.com/watch?v=6BrZryMz-ac",
          },
          {
            name: "Sebastian Lague AI Tutorial",
            url: "https://www.youtube.com/watch?v=6BrZryMz-ac",
            ytlink: "https://www.youtube.com/watch?v=6BrZryMz-ac",
          },
        ],
        milestone: "Design two playable levels with increasing difficulty",
        completed: false,
      },
      {
        week: 9,
        title: "Polish & Optimization",
        description: "Improve visual feel, particles, lighting, and runtime performance",
        skills: [
          "Lighting",
          "Particles",
          "Mobile Optimization",
          "Frame Rate Tuning"
        ],
        resources: [
          {
            name: "Unity Profiler Documentation",
            url: "https://docs.unity3d.com/Manual/Profiler.html",
            ytlink: "https://www.youtube.com/watch?v=AmGSEH7QcDg",
          },
          {
            name: "Unity Performance Tips",
            url: "https://unity.com/how-to/optimize-game-performance-mobile-devices",
            ytlink: "https://www.youtube.com/watch?v=AmGSEH7QcDg",
          },
          {
            name: "Unity Visual Effect Graph",
            url: "https://unity.com/visual-effect-graph",
            ytlink: "https://www.youtube.com/watch?v=AmGSEH7QcDg",
          },
          {
            name: "Game Feel by Steve Swink",
            url: "https://www.amazon.com/Game-Feel-Designers-Sensation-Purchase/dp/0123743281",
            ytlink: "https://www.youtube.com/watch?v=XtQMytORBmM",
          },
        ],
        milestone: "Make your game smooth and visually appealing",
        completed: false,
      },
      {
        week: 10,
        title: "Capstone & Publishing",
        description: "Finish, build, and publish your game to itch.io or Android/WebGL",
        skills: [
          "Build Settings",
          "APK or WebGL Export",
          "Itch.io Upload",
          "Publishing Basics"
        ],
        resources: [
          {
            name: "Unity Build Settings Documentation",
            url: "https://docs.unity3d.com/Manual/BuildSettings.html",
            ytlink: "https://www.youtube.com/watch?v=gB1F9G0JXOo",
          },
          {
            name: "Google Play Console Guide",
            url: "https://support.google.com/googleplay/android-developer/",
            ytlink: "https://www.youtube.com/watch?v=gB1F9G0JXOo",
          },
          {
            name: "Itch.io Creator Documentation",
            url: "https://itch.io/docs/creators/",
            ytlink: "https://www.youtube.com/watch?v=gB1F9G0JXOo",
          },
          {
            name: "Unity WebGL Publishing",
            url: "https://docs.unity3d.com/Manual/webgl-building.html",
            ytlink: "https://www.youtube.com/watch?v=gB1F9G0JXOo",
          },
        ],
        milestone: "Publish your final game project to itch.io or Android/WebGL",
        completed: false,
      },
    ],
  },
  {
    role: "BlockchainDeveloper",
    description: "Build decentralized applications and smart contracts using blockchain technology",
    duration: "10 weeks",
    difficulty: "Advanced",
    weeks: [
      {
        week: 1,
        title: "Blockchain Fundamentals & Ethereum",
        description: "Core concepts + first smart contract",
        skills: ["Distributed Ledger", "EVM", "Remix IDE", "Gas"],
        resources: [
          {
            name: "Bitcoin Whitepaper",
            url: "https://bitcoin.org/bitcoin.pdf",
            ytlink: "https://www.youtube.com/watch?v=bBC-nkkpfc9",
          },
          {
            name: "Ethereum.org Developer Resources",
            url: "https://ethereum.org/en/developers/",
            ytlink: "https://www.youtube.com/watch?v=54mBzN6J1Tc",
          },
          {
            name: "Blockchain Demo - Anders Brownworth",
            url: "https://andersbrownworth.com/blockchain/",
            ytlink: "https://www.youtube.com/watch?v=bBC-nkkpfc9",
          },
        ],
        milestone: "Deploy Hello World contract on Remix",
        completed: false,
      },
      {
        week: 2,
        title: "Solidity Programming",
        description: "Master smart contract development language",
        skills: ["Data Types", "Functions", "Mappings", "Inheritance"],
        resources: [
          {
            name: "Solidity Documentation",
            url: "https://docs.soliditylang.org/en/latest/",
            ytlink: "https://www.youtube.com/watch?v=ipwxYa-F1uY",
          },
          {
            name: "CryptoZombies - Learn Solidity",
            url: "https://cryptozombies.io/",
            ytlink: "https://www.youtube.com/watch?v=ipwxYa-F1uY",
          },
          {
            name: "Solidity by Example",
            url: "https://solidity-by-example.org/",
            ytlink: "https://www.youtube.com/watch?v=ipwxYa-F1uY",
          },
        ],
        milestone: "Build a voting contract",
        completed: false,
      },
      {
        week: 3,
        title: "Development Tools & Testnets",
        description: "Professional dev environment + deployment",
        skills: ["Hardhat", "Ganache", "Metamask", "Testnets"],
        resources: [
          {
            name: "Hardhat Documentation",
            url: "https://hardhat.org/docs",
            ytlink: "https://www.youtube.com/watch?v=gyew3iK5PSo",
          },
          {
            name: "Truffle Suite Documentation",
            url: "https://trufflesuite.com/docs/",
            ytlink: "https://www.youtube.com/watch?v=gyew3iK5PSo",
          },
          {
            name: "Alchemy Ethereum Development",
            url: "https://docs.alchemy.com/docs",
            ytlink: "https://www.youtube.com/watch?v=gyew3iK5PSo",
          },
        ],
        milestone: "Deploy contract to Sepolia testnet",
        completed: false,
      },
      {
        week: 4,
        title: "Cryptography & Wallets",
        description: "Keys, signatures, and wallet integration",
        skills: ["Public/Private Keys", "Digital Signatures", "Wallet Integration"],
        resources: [
          {
            name: "Practical Cryptography for Developers",
            url: "https://cryptobook.nakov.com/",
            ytlink: "https://www.youtube.com/watch?v=jw9-v4X9ORo",
          },
          {
            name: "MetaMask Developer Documentation",
            url: "https://docs.metamask.io/",
            ytlink: "https://www.youtube.com/watch?v=2WaP2DwaUNg",
          },
        ],
        milestone: "Create Web3 login with Metamask",
        completed: false,
      },
      {
        week: 5,
        title: "Web3 Frontend Integration",
        description: "Connect DApps to blockchain with JavaScript",
        skills: ["Web3.js", "Ethers.js", "Contract ABI"],
        resources: [
          {
            name: "Web3.js Documentation",
            url: "https://web3js.readthedocs.io/en/v1.8.0/",
            ytlink: "https://www.youtube.com/watch?v=ro-9pSgy9AQ",
          },
          {
            name: "Ethers.js Documentation",
            url: "https://docs.ethers.io/v5/",
            ytlink: "https://www.youtube.com/watch?v=ro-9pSgy9AQ",
          },
        ],
        milestone: "Build token balance viewer DApp",
        completed: false,
      },
      {
        week: 6,
        title: "ERC-20 Tokens & NFTs",
        description: "Create tokens and NFTs with OpenZeppelin",
        skills: ["ERC-20", "ERC-721", "OpenZeppelin"],
        resources: [
          {
            name: "OpenZeppelin Documentation",
            url: "https://docs.openzeppelin.com/",
            ytlink: "https://www.youtube.com/watch?v=kySfm8Ndu3s",
          },
          {
            name: "EIP-20 Token Standard",
            url: "https://eips.ethereum.org/EIPS/eip-20",
            ytlink: "https://www.youtube.com/watch?v=kySfm8Ndu3s",
          },
        ],
        milestone: "Deploy ERC-20 token + NFT collection",
        completed: false,
      },
      {
        week: 7,
        title: "Smart Contract Security",
        description: "Secure coding practices and common attacks",
        skills: ["Reentrancy", "Gas Optimization", "Audits"],
        resources: [
          {
            name: "Ethernaut - Smart Contract Security",
            url: "https://ethernaut.openzeppelin.com/",
            ytlink: "https://www.youtube.com/watch?v=C7A0k9KpaCs",
          },
          {
            name: "ConsenSys Smart Contract Best Practices",
            url: "https://consensys.github.io/smart-contract-best-practices/",
            ytlink: "https://www.youtube.com/watch?v=C7A0k9KpaCs",
          },
        ],
        milestone: "Complete Ethernaut challenges",
        completed: false,
      },
      {
        week: 8,
        title: "IPFS & Decentralized Storage",
        description: "Store NFT metadata and files off-chain",
        skills: ["IPFS", "ENS", "Decentralized Storage"],
        resources: [
          {
            name: "IPFS Documentation",
            url: "https://docs.ipfs.io/",
            ytlink: "https://www.youtube.com/watch?v=5Uj6uR3fp6o",
          },
          {
            name: "Ethereum Name Service Documentation",
            url: "https://docs.ens.domains/",
            ytlink: "https://www.youtube.com/watch?v=5Uj6uR3fp6o",
          },
        ],
        milestone: "Upload NFT metadata to IPFS",
        completed: false,
      },
      {
        week: 9,
        title: "DeFi & Advanced Protocols",
        description: "Lending, DEX, and oracle integration",
        skills: ["Flash Loans", "Oracles", "Uniswap V3"],
        resources: [
          {
            name: "DeFiLlama Analytics",
            url: "https://defillama.com/",
            ytlink: "https://www.youtube.com/watch?v=ybCISNYw6W8",
          },
        ],
        milestone: "Build simple DeFi dashboard",
        completed: false,
      },
      {
        week: 10,
        title: "Capstone Full-Stack DApp",
        description: "Production-ready decentralized application",
        skills: ["Full-stack DApp", "Testing", "Deployment"],
        resources: [
          {
            name: "Full Stack DApp Tutorial",
            url: "https://ethereum.org/en/developers/tutorials/",
            ytlink: "https://www.youtube.com/watch?v=6Gf_kRE4kk8",
          },
          {
            name: "Fleek Web3 Hosting",
            url: "https://fleek.co/",
            ytlink: "https://www.youtube.com/watch?v=6Gf_kRE4kk8",
          },
        ],
        milestone: "Deploy complete DApp (NFT marketplace/voting/governance)",
        completed: false,
      },
    ],
  },
  {
    role: "UI/UXDesigner",
    description: "Design intuitive and visually appealing user experiences for web and mobile apps",
    duration: "10 weeks",
    difficulty: "Intermediate",
    weeks: [
      {
        week: 1,
        title: "UI/UX Fundamentals",
        description: "Understand UI vs UX, design thinking, and user-centered principles",
        skills: ["UI vs UX", "Design Process", "Design Thinking", "User-Centered Design"],
        resources: [
          {
            name: "Nielsen Norman Group",
            url: "https://www.nngroup.com/articles/",
            ytlink: "https://www.youtube.com/watch?v=1r8fA5q7E2s",
          },
          {
            name: "Interaction Design Foundation",
            url: "https://www.interaction-design.org/",
            ytlink: "https://www.youtube.com/watch?v=1r8fA5q7E2s",
          },
          {
            name: "Google Design - Material Design",
            url: "https://material.io/design",
            ytlink: "https://www.youtube.com/watch?v=1r8fA5q7E2s",
          },
        ],
        milestone: "Document the complete UI/UX design process",
        completed: false,
      },
      {
        week: 2,
        title: "UX Research & Personas",
        description: "Conduct research and create detailed user personas",
        skills: ["User Interviews", "Surveys", "Empathy Maps", "Personas"],
        resources: [
          {
            name: "UX Research Methods - Nielsen Norman Group",
            url: "https://www.nngroup.com/articles/which-ux-research-methods/",
            ytlink: "https://www.youtube.com/watch?v=2N1v2f3q5hM",
          },
          {
            name: "User Persona Templates - Miro",
            url: "https://miro.com/templates/persona/",
            ytlink: "https://www.youtube.com/watch?v=2N1v2f3q5hM",
          },
          {
            name: "UX Planet - User Research",
            url: "https://uxplanet.org/tagged/user-research",
            ytlink: "https://www.youtube.com/watch?v=2N1v2f3q5hM",
          },
        ],
        milestone: "Create 3 detailed user personas for a mobile banking app",
        completed: false,
      },
      {
        week: 3,
        title: "Information Architecture",
        description: "Plan app structure with sitemaps and user flows",
        skills: ["Sitemaps", "User Flows", "Card Sorting", "Task Flows"],
        resources: [
          {
            name: "Information Architecture - UXBooth",
            url: "https://www.uxbooth.com/articles/complete-beginners-guide-to-information-architecture/",
            ytlink: "https://www.youtube.com/watch?v=6f2bPq3v8kI",
          },
          {
            name: "User Flow Templates - Figma",
            url: "https://www.figma.com/templates/user-flows/",
            ytlink: "https://www.youtube.com/watch?v=6f2bPq3v8kI",
          },
          {
            name: "Card Sorting Guide - Usability.gov",
            url: "https://www.usability.gov/how-to-and-tools/methods/card-sorting.html",
            ytlink: "https://www.youtube.com/watch?v=6f2bPq3v8kI",
          },
        ],
        milestone: "Create sitemap + user flows for a social media app",
        completed: false,
      },
      {
        week: 4,
        title: "Wireframing Essentials",
        description: "Master low-fidelity wireframing and UX heuristics",
        skills: ["Lo-fi Wireframes", "Sketching", "Wireframing Tools", "UX Heuristics"],
        resources: [
          {
            name: "Wireframing Guide - Balsamiq",
            url: "https://balsamiq.com/learn/articles/what-are-wireframes/",
            ytlink: "https://www.youtube.com/watch?v=9jK-NcRmVcw",
          },
          {
            name: "Figma Wireframing Kit",
            url: "https://www.figma.com/community/file/809275435084021733",
            ytlink: "https://www.youtube.com/watch?v=9jK-NcRmVcw",
          },
          {
            name: "UX Heuristics - Nielsen Norman Group",
            url: "https://www.nngroup.com/articles/ten-usability-heuristics/",
            ytlink: "https://www.youtube.com/watch?v=9jK-NcRmVcw",
          },
        ],
        milestone: "Wireframe complete onboarding flow for fitness app",
        completed: false,
      },
      {
        week: 5,
        title: "UI Design Principles",
        description: "Master color theory, typography, and visual hierarchy",
        skills: ["Color Theory", "Typography", "Spacing & Layout", "Visual Hierarchy"],
        resources: [
          {
            name: "Refactoring UI - Design Tips",
            url: "https://refactoringui.com/",
            ytlink: "https://www.youtube.com/watch?v=Q8uXEWD__Vo",
          },
          {
            name: "Canva Design School",
            url: "https://www.canva.com/designschool/",
            ytlink: "https://www.youtube.com/watch?v=Q8uXEWD__Vo",
          },
          {
            name: "Adobe Color Theory",
            url: "https://color.adobe.com/create/color-wheel",
            ytlink: "https://www.youtube.com/watch?v=Q8uXEWD__Vo",
          },
        ],
        milestone: "Design 5 mobile screens following design principles",
        completed: false,
      },
      {
        week: 6,
        title: "Figma Mastery",
        description: "Build reusable design systems and components in Figma",
        skills: ["Auto Layout", "Components", "Design Systems", "Variants"],
        resources: [
          {
            name: "Figma Academy",
            url: "https://www.figma.com/academy/",
            ytlink: "https://www.youtube.com/watch?v=lg7w3N9I8uM",
          },
          {
            name: "Figma Design System Tutorial",
            url: "https://help.figma.com/hc/en-us/articles/360038662654-Guide-to-design-systems-in-Figma",
            ytlink: "https://www.youtube.com/watch?v=lg7w3N9I8uM",
          },
          {
            name: "Figma Community Resources",
            url: "https://www.figma.com/community",
            ytlink: "https://www.youtube.com/watch?v=lg7w3N9I8uM",
          },
        ],
        milestone: "Create complete design system (buttons, cards, forms)",
        completed: false,
      },
      {
        week: 7,
        title: "Prototyping & Microinteractions",
        description: "Build interactive prototypes with smooth transitions",
        skills: ["Screen Linking", "Microinteractions", "Transitions", "Animations"],
        resources: [
          {
            name: "Figma Prototyping Documentation",
            url: "https://help.figma.com/hc/en-us/articles/360040314193-Guide-to-prototyping-in-Figma/",
            ytlink: "https://www.youtube.com/watch?v=0f6y8g7xW2E",
          },
          {
            name: "Microinteractions Guide - UX Planet",
            url: "https://uxplanet.org/microinteractions-the-secret-to-great-app-design-4cfe70fbaccf",
            ytlink: "https://www.youtube.com/watch?v=0f6y8g7xW2E",
          },
          {
            name: "Framer Motion Documentation",
            url: "https://www.framer.com/motion/",
            ytlink: "https://www.youtube.com/watch?v=0f6y8g7xW2E",
          },
        ],
        milestone: "Build interactive e-commerce checkout prototype",
        completed: false,
      },
      {
        week: 8,
        title: "Usability Testing",
        description: "Test designs with real users and iterate based on feedback",
        skills: ["A/B Testing", "Usability Sessions", "Heatmaps", "Feedback Analysis"],
        resources: [
          {
            name: "Usability Testing Guide - Usability.gov",
            url: "https://www.usability.gov/how-to-and-tools/methods/usability-testing.html",
            ytlink: "https://www.youtube.com/watch?v=5tM5y8v2nK0",
          },
          {
            name: "Maze - User Testing Platform",
            url: "https://maze.co/guides/",
            ytlink: "https://www.youtube.com/watch?v=5tM5y8v2nK0",
          },
          {
            name: "A/B Testing Guide - Optimizely",
            url: "https://www.optimizely.com/optimization-glossary/ab-testing/",
            ytlink: "https://www.youtube.com/watch?v=5tM5y8v2nK0",
          },
        ],
        milestone: "Run usability test + create iteration plan",
        completed: false,
      },
      {
        week: 9,
        title: "Accessibility & UX Writing",
        description: "Make designs inclusive and improve microcopy",
        skills: ["WCAG Guidelines", "Microcopy", "Error States", "ARIA Labels"],
        resources: [
          {
            name: "UX Writing Hub",
            url: "https://uxwritinghub.com/",
            ytlink: "https://www.youtube.com/watch?v=3v8K9m2pQ4R",
          },
          {
            name: "WCAG Guidelines - W3C",
            url: "https://www.w3.org/WAI/WCAG21/quickref/",
            ytlink: "https://www.youtube.com/watch?v=3v8K9m2pQ4R",
          },
          {
            name: "Google UX Writing Guide",
            url: "https://developers.google.com/style/tone",
            ytlink: "https://www.youtube.com/watch?v=3v8K9m2pQ4R",
          },
        ],
        milestone: "Audit design for accessibility + rewrite error messages",
        completed: false,
      },
      {
        week: 10,
        title: "Capstone Portfolio Project",
        description: "Complete end-to-end design project for your portfolio",
        skills: ["Full Design Process", "Portfolio Presentation", "Case Study"],
        resources: [
          {
            name: "Dribbble Design Inspiration",
            url: "https://dribbble.com/",
            ytlink: "https://www.youtube.com/watch?v=EbyjnAMMQSk",
          },
          {
            name: "Behance Portfolio Examples",
            url: "https://www.behance.net/",
            ytlink: "https://www.youtube.com/watch?v=EbyjnAMMQSk",
          },
          {
            name: "Design Portfolio Guide - Adobe",
            url: "https://xd.adobe.com/ideas/career-tips/how-to-build-design-portfolio/",
            ytlink: "https://www.youtube.com/watch?v=EbyjnAMMQSk",
          },
        ],
        milestone: "Design complete app + publish case study to Behance",
        completed: false,
      },
    ],
  },
];
