import React from 'react';
import { Box, Typography, InputBase } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

const Navbar = () => {
  return (
    <Box sx={{
      width: '100%',
      height: '90px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid #eaeaea',
      padding: '0 80px',
      boxSizing: 'border-box',
      backgroundColor: '#fff',
    }}>
      {/* Left: Logo */}
      <Box sx={{ flex: 1 }}>
        <Typography 
          variant="h4" 
          component="div" 
          sx={{ 
            fontFamily: '"Tenaka", serif', 
            letterSpacing: '2px', 
            cursor: 'pointer', 
            color: '#000',
            fontWeight: 'normal'
          }}
        >
          ZIVORA
        </Typography>
      </Box>

      {/* Center-left: Links */}
      <Box sx={{ display: 'flex', gap: '40px', alignItems: 'center', flex: 2 }}>
        <Typography sx={{ cursor: 'pointer', fontSize: '12px', fontWeight: 600, letterSpacing: '1.5px', color: '#c8815f' }}>HOME</Typography>
        <Typography sx={{ cursor: 'pointer', fontSize: '12px', fontWeight: 500, letterSpacing: '1.5px', color: '#000' }}>COLLECTION</Typography>
        <Typography sx={{ cursor: 'pointer', fontSize: '12px', fontWeight: 500, letterSpacing: '1.5px', color: '#000' }}>BUNDLES</Typography>
        <Typography sx={{ cursor: 'pointer', fontSize: '12px', fontWeight: 500, letterSpacing: '1.5px', color: '#000' }}>TESTIMONIALS</Typography>
        <Typography sx={{ cursor: 'pointer', fontSize: '12px', fontWeight: 500, letterSpacing: '1.5px', color: '#000' }}>CONTACT</Typography>
      </Box>

      {/* Right: Icons */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, justifyContent: 'flex-end' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '2px', width: '200px' }}>
          <InputBase placeholder="Search" sx={{ fontSize: '13px', fontStyle: 'italic', color: '#000', flex: 1 }} />
          <SearchIcon sx={{ color: '#000', cursor: 'pointer', fontSize: '20px' }} />
        </Box>
        <Box sx={{
          width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#000',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
        }}>
          <ShoppingBagIcon sx={{ color: '#fff', fontSize: '18px' }} />
        </Box>
        <Box sx={{
          width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #ddd',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: '#fff'
        }}>
          <PersonOutlineOutlinedIcon sx={{ color: '#000', fontSize: '18px' }} />
        </Box>
      </Box>
    </Box>
  );
};

export default Navbar;
