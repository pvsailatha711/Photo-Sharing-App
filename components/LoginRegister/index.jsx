import React, { useState } from 'react';
import "./styles.css";

function LoginPage({ onLogin }) {
    const [loginName, setLoginName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onLogin) {
            onLogin(loginName.toLowerCase());
        }
    };

    return (
        <div className='page'>
            <div className='overlay'>
                <form onSubmit={handleSubmit} className='form'>
                    <h2 className='title'>Welcome Back!</h2>
                    <input
                        type="text"
                        placeholder="Enter login name"
                        value={loginName}
                        onChange={(e) => setLoginName(e.target.value)}
                        className='input'
                    />
                    <button type="submit" className='button'>Login</button>
                </form>
            </div>
        </div>
    );
}
export default LoginPage;