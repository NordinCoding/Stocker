import { useState, useEffect } from 'react';

// This function is used by both the register form and the login form
function ResponseForm({responseObject}) {
    const [feedback, setFeedback] = useState("");

    useEffect(() => {
    if (!responseObject) return;

    const data = responseObject.data;

    // Simple validation checks for relevant user feedback
    if (data.username?.[0] === "This field may not be blank." || 
        data.password?.[0] === "This field may not be blank." || 
        data.password2?.[0] === "This field may not be blank.") {
        setFeedback("Please fill in all fields");
    }

    if (data.password?.[0] === "Password fields didn't match.") {
        setFeedback("Password fields don't match")
    }

    if (data.username?.[0] === "A user with that username already exists.") {
        setFeedback("Username is already in use")
    }
    
    if (data.detail === "No active account found with the given credentials") {
        setFeedback("Invalid username and/or password")
    }

    // Clear the message after 2 seconds
    const timer = setTimeout(() => {
        setFeedback("");
    }, 2000);

    // Cleanup timeout if component unmounts
    return () => clearTimeout(timer);
    }, [responseObject]);

    if (!feedback) return null;

    return (
    <div>
        <p className="text-red-400">{feedback}</p>
    </div>
    );
}

export default ResponseForm