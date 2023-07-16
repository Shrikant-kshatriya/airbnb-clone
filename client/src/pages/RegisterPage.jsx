import { useState } from "react";
import { Link, Navigate, redirect } from "react-router-dom";
import axios from 'axios';

export default function RegisterPage() {
    const [name,setName] = useState('');
    const [email,setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [redirect, setRedirect] = useState(false);

    async function registerUser(e){
        e.preventDefault();
        try {
            await axios.post('/register',{
                name,
                email,
                password,
            });
            alert('Registration successful, Now you can log in.');
            setRedirect(true);
        } catch (error) {
            alert('Registration failed, Please try again later.')
        }
    }
    if(redirect){
        return (<Navigate to={'/login'}/>)
    }

    return (
        <div className="mt-4 grow flex items-center justify-around">
            <div className="mb-32">
                <h1 className="text-4xl text-center mb-4">Register</h1>
                <form className="max-w-md mx-auto" onSubmit={registerUser}>
                    <input type="text" placeholder="your name" 
                    value={name} 
                    onChange={e => setName(e.target.value)}/>
                    <input type="email" placeholder="your@email.com" value={email}
                    onChange={e => setEmail(e.target.value)}/>
                    <input type="password" placeholder="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}/>
                    <button className="primary">Register</button>
                    <div className="text-center py-2 text-gray-500">Already a member? <Link className="text-black underline" to={'/login'}>Login</Link></div>
                </form>
            </div>
        </div>
    )
}