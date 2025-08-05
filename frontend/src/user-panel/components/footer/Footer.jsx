import React from 'react';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#f8f9fa', padding: '50px 0' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>Follow Us On Social Media</h2>
        <p style={{ fontSize: '16px', color: '#6c757d', marginBottom: '20px' }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed tincidunt dui ultricies sollicitudin.
        </p>

        <div style={{ marginBottom: '30px' }}>
          <a href="#" style={{ margin: '0 15px', textDecoration: 'none', color: '#6c757d' }}>Facebook</a>
          <a href="#" style={{ margin: '0 15px', textDecoration: 'none', color: '#6c757d' }}>Twitter</a>
          <a href="#" style={{ margin: '0 15px', textDecoration: 'none', color: '#6c757d' }}>Instagram</a>
        </div>
      </div>

      <div style={{ backgroundColor: '#343a40', color: 'white', textAlign: 'center', padding: '15px 0' }}>
        {/* <div>
          <a href="#" style={{ color: 'white', marginRight: '15px', textDecoration: 'none' }}>Support Center</a>
          <a href="#" style={{ color: 'white', marginRight: '15px', textDecoration: 'none' }}>Invoicing</a>
          <a href="#" style={{ color: 'white', marginRight: '15px', textDecoration: 'none' }}>Contact</a>
          <a href="#" style={{ color: 'white', marginRight: '15px', textDecoration: 'none' }}>Careers</a>
          <a href="#" style={{ color: 'white', marginRight: '15px', textDecoration: 'none' }}>Blog</a>
          <a href="#" style={{ color: 'white', marginRight: '15px', textDecoration: 'none' }}>FAQ's</a>
        </div> */}

        

        <p style={{ marginTop: '15px', fontSize: '14px' }}>
          &copy; 2025 Magic Mart, All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
