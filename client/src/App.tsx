import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
// import GitHubCorner from "./components/GitHubCorner"
import Toast from "./components/toast/Toast";
import EditorPage from "./pages/EditorPage";
import HomePage from "./pages/HomePage";
import IntroPage from "./pages/intropage"; // Import the new page

const App = () => {
    return (
        <>
            <Router>
                <Routes>
                    <Route path="/" element={<IntroPage />} /> {/* Intro page */}
                    <Route path="/home" element={<HomePage />} /> {/* Updated HomePage route */}
                    <Route path="/editor/:roomId" element={<EditorPage />} />
                </Routes>
            </Router>
            <Toast /> {/* Toast component from react-hot-toast */}
            {/* <GitHubCorner /> */}
        </>
    );
};

export default App;
