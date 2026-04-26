import React from 'react';

const SupportSection = () => {
  // ---------------------------------------------------------
  // تنظیمات: لینک پرداخت خود را اینجا قرار دهید
  const paymentLink = "https://pa.l1s.ir/link/767642";
  // ---------------------------------------------------------

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      direction: 'rtl'
    }}>
      {/* باکس اصلی */}
      <div style={{
        background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
        border: '1px solid #e0e0e0',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        maxWidth: '500px',
        width: '100%',
        padding: '30px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.3s ease'
      }}>
        
        {/* افکت تزئینی پس‌زمینه (اختیاری) */}
        <div style={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: '100px',
          height: '100px',
          background: 'rgba(99, 102, 241, 0.1)',
          borderRadius: '50%',
          zIndex: 0
        }}></div>

        {/* محتوا */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          
          {/* آیکون قلب متحرک */}
          <div style={{ fontSize: '40px', marginBottom: '15px', animation: 'pulse 2s infinite' }}>
            ❤️
          </div>

          <h3 style={{
            margin: '0 0 10px 0',
            color: '#1f2937',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            حمایت شما، انرژی من است
          </h3>

          <p style={{
            color: '#6b7280',
            lineHeight: '1.6',
            margin: '0 0 25px 0',
            fontSize: '15px'
          }}>
            اگر از کیفیت کار و محتوایی که ارائه میدم راضی هستید، لطفاً با یک حمایت مالی کوچک، مرا در ادامه راه یاری کنید. این کار باعث انگیزه مضاعف من خواهد شد.
          </p>

          {/* دکمه حمایت */}
          <a 
            href={paymentLink} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              textDecoration: 'none',
              background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
              color: 'white',
              padding: '14px 32px',
              borderRadius: '50px',
              fontWeight: 'bold',
              fontSize: '16px',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              border: 'none'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.6)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.4)';
            }}
          >
            حمایت مالی 💎
          </a>
          
          <p style={{
            marginTop: '15px',
            fontSize: '12px',
            color: '#9ca3af'
          }}>
            پرداخت امن و سریع
          </p>
        </div>
      </div>

      {/* انیمیشن Keyframes برای قلب */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default SupportSection;