import React, { useState } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import "./styles.css";
import axios from 'axios';

function LoginPage({ onLogin }) {
    const [loginName, setLoginName] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [occupation, setOccupation] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isRegistering) {
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                return;
            }
            try {
                await axios.post('/user', {
                    login_name: loginName.toLowerCase(),
                    password,
                    first_name: firstName,
                    last_name: lastName,
                    location,
                    description,
                    occupation
                });
                setSuccess('Registration successful! You can now log in.');
                setError('');
                setLoginName('');
                setPassword('');
                setConfirmPassword('');
                setFirstName('');
                setLastName('');
                setLocation('');
                setDescription('');
                setOccupation('');
            } catch (err) {
                setError(err.response?.data || 'Registration failed');
            }
        } else {
            try {
                onLogin(loginName.toLowerCase(), password);
            } catch (err) {
                setError(err.response?.data || 'Login failed');
            }
        }
    };
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className='page'>
            <div className='overlay'>
                <form onSubmit={handleSubmit} className='form'>
                    <h2 className='title'>{isRegistering ? 'Register' : 'Welcome Back!'}</h2>
                    <input
                        type="text"
                        placeholder="Enter login name"
                        value={loginName}
                        onChange={(e) => setLoginName(e.target.value)}
                        className='input'
                        required
                    />
                    <input
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className='input'
                        required
                    />
                    {isRegistering && (
                        <>
                            <div className='password-container'>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Confirm password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className='input'
                                    required
                                />
                                {
                                showPassword ?
                                 <VisibilityIcon color="action" fontSize="small" onClick={togglePasswordVisibility} className='password-icon' /> : 
                                 <VisibilityOffIcon color="action" fontSize="small" onClick={togglePasswordVisibility} className='password-icon'/>
                                }
                            </div>
                            <input
                                type="text"
                                placeholder="First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className='input'
                                required
                            />
                            <input
                                type="text"
                                placeholder="Last Name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className='input'
                                required
                            />
                            <input
                                type="text"
                                placeholder="Location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className='input'
                            />
                            <input
                                type="text"
                                placeholder="Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className='input'
                            />
                            <input
                                type="text"
                                placeholder="Occupation"
                                value={occupation}
                                onChange={(e) => setOccupation(e.target.value)}
                                className='input'
                            />
                        </>
                    )}
                    {error && <p className="error">{error}</p>}
                    {success && <p className="success">{success}</p>}
                    <button type="submit" className='button'>
                        {isRegistering ? 'Register Me' : 'Login'}
                    </button>
                    <br />
                    <button
                        type="button"
                        className='button'
                        onClick={() => {
                            setIsRegistering(!isRegistering);
                            setError('');
                            setSuccess('');
                        }}
                    >
                        {isRegistering ? 'Switch to Login' : 'Switch to Register'}
                    </button>
                </form>
            </div>
        </div>
    );
}
export default LoginPage;
