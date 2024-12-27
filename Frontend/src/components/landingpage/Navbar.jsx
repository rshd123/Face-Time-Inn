import {Link} from 'react-router-dom'

export default function Navbar(){
    return (
        <div className="navbar">
            <div>
                <Link to={'/'} className="title"><h2>Face Time Inn</h2></Link>
            </div>
            <div className="auth-container">
                <Link href="#" className="guestAuth">Log in as guest</Link>
                <Link to={'/register'}><button className="register">Register</button></Link>
            </div>
        </div>
    );
}