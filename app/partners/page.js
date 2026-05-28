'use client';
import { useState } from 'react';

export default function Partners() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      <section className="partners-hero">
        <div className="container" style={{textAlign:'center'}}>
          <div className="section-badge">FOR GYM OWNERS</div>
          <h1 className="hero-title" style={{fontSize:'3rem'}}>GROW YOUR GYM<br/>WITH GYM-ON-GO</h1>
          <p className="hero-sub" style={{margin:'16px auto',maxWidth:500}}>List your gym and reach thousands of active fitness seekers in your city.</p>
        </div>
      </section>

      <section style={{padding:'40px 0'}}>
        <div className="container">
          <h2 className="section-title" style={{textAlign:'center'}}>Why Partner With Us?</h2>
          <div className="benefits-grid">
            {[
              {icon:'fa-users',title:'50K+ Active Users',desc:'Instant exposure to a massive fitness community.'},
              {icon:'fa-chart-line',title:'Fill Empty Slots',desc:'Monetize off-peak hours and maximize revenue.'},
              {icon:'fa-wallet',title:'Weekly Payouts',desc:'Hassle-free weekly settlements to your bank.'},
              {icon:'fa-star',title:'Build Your Brand',desc:'Verified badge, real reviews, and premium profile.'},
            ].map((b,i) => (
              <div className="benefit-card" key={i}>
                <div className="benefit-icon"><i className={`fa-solid ${b.icon}`}></i></div>
                <h4>{b.title}</h4>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="partner-form-section">
        <h2>Register Your Gym</h2>
        <p style={{color:'var(--muted)',textAlign:'center',marginBottom:32}}>Fill in details and our team will reach out within 24 hours.</p>
        {!submitted ? (
          <form className="partner-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group"><label>Gym Name</label><input placeholder="Elite Fitness Club" required /></div>
              <div className="form-group"><label>Owner Name</label><input placeholder="Rajesh Sharma" required /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Email</label><input type="email" placeholder="gym@example.com" required /></div>
              <div className="form-group"><label>Phone</label><input placeholder="+91 98765 43210" required /></div>
            </div>
            <div className="form-group"><label>City</label>
              <select required><option value="">Select city</option><option>Mumbai</option><option>Bengaluru</option><option>Delhi</option><option>Ahmedabad</option><option>Chennai</option><option>Hyderabad</option><option>Pune</option></select>
            </div>
            <button className="btn-primary" style={{width:'100%',marginTop:8}}>SUBMIT APPLICATION</button>
          </form>
        ) : (
          <div className="partner-success">
            <i className="fa-solid fa-circle-check" style={{fontSize:'3rem',color:'#22c55e'}}></i>
            <h3 style={{marginTop:16}}>Application Received!</h3>
            <p style={{color:'var(--muted)'}}>We&apos;ll get back to you within 24 hours.</p>
          </div>
        )}
      </section>
    </>
  );
}
