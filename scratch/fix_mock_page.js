const fs = require('fs');

let code = fs.readFileSync('app/mock/week/[weekid]/page.jsx', 'utf8');

// 1. Add useRouter to import if not present
if (!code.includes('useRouter')) {
  code = code.replace(
    /import\s*\{\s*useParams,\s*useSearchParams\s*\}\s*from\s*['"]next\/navigation['"];/,
    "import { useParams, useSearchParams, useRouter } from 'next/navigation';"
  );
}

// 2. Add router and missing states
const statesRegex = /const weekId = parseInt\(params\.weekid\);[\s\S]*?const \[showExitConfirmModal, setShowExitConfirmModal\] = useState\(false\);/;
const correctStates = `const router = useRouter();
  const weekId = parseInt(params.weekid);
  const roadmap = searchParams.get('roadmap') || 'webdeveloper'; // Get roadmap from URL params
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [quizStarted, setQuizStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);`;

code = code.replace(statesRegex, correctStates);

// 3. Update Exit button to use router.push('/roadmaps')
code = code.replace('window.history.back();', "router.push('/roadmaps');");

// 4. Clean duplicate closing at the end
code = code.replace(/export default QuizPage;\s*\);\s*};\s*export default QuizPage;\s*$/, 'export default QuizPage;\n');

fs.writeFileSync('app/mock/week/[weekid]/page.jsx', code, 'utf8');
console.log('Successfully updated app/mock/week/[weekid]/page.jsx');
