import Navbar from "./Navbar";
export default function LandingPage(){
    return(
        <div className="LandingPage">
            <Navbar/>
            <div className="info">
                <div className="left-section">
                    <p style={{fontSize:'3rem'}}><b>Connect</b> with your Loved Ones</p>
                    <p style={{fontSize:'1.5rem',margin:'30px 0px 30px 0px'}}>Video call any distance by Face Time Inn</p>
                    <button className="get-started">Get Started</button>
                </div>
                <div className="right-section">
                    <img src="/mobile.png" alt="img" />
                </div>
            </div>
        </div>
    );
}