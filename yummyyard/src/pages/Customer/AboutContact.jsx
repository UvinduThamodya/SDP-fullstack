import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Link,
  Button, 
  Grid, 
  Paper, 
  Card,
  CardContent,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { 
  Facebook as FacebookIcon, 
  Email as EmailIcon, 
  Phone as PhoneIcon, 
  LocationOn as LocationIcon,
  Send as SendIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import Navbar from '../../components/Navbar'; // Import the Navbar component

// Placeholder image for the About Us section (replace with your actual image)
import aboutUsImage from '../../assets/about-us-image.jpg'; // Adjust the path to your image

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  height: '100%',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 28px rgba(0, 0, 0, 0.18)',
  }
}));

const ContactCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
  }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  position: 'relative',
  marginBottom: theme.spacing(4),
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: -10,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 80,
    height: 4,
    backgroundColor: theme.palette.primary.main,
    borderRadius: 2,
  }
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'rgba(0, 0, 0, 1)',
  marginRight: theme.spacing(1),
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#3ACA82',
    transform: 'translateY(-3px)',
  }
}));

const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #3dcd83 0%, #2bb673 100%)',
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(12, 0),
  borderRadius: 0,
  marginBottom: theme.spacing(6),
  textAlign: 'center',
  width: '100vw',
  maxWidth: '100vw',
  position: 'relative',
  marginLeft: '-50vw',
  marginRight: '-50vw',
  boxSizing: 'border-box',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url("/path/to/subtle-pattern.png")',
    opacity: 0.1,
    zIndex: 1,
  }
}));


const AboutUsImage = styled('img')(({ theme }) => ({
  width: '100%',
  height: 'auto',
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  objectFit: 'cover',
  maxHeight: '400px', // Adjust based on your preference
}));

const AboutContact = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setFormData({ name: '', email: '', subject: '', message: '' });
        alert('Message sent successfully!');
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('An error occurred. Please try again later.');
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#fdfef8', fontFamily: 'Poppins, sans-serif' }}>
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Navbar /> {/* Add the Navbar component */}
      </Box>
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fdfef8', fontFamily: 'Poppins, sans-serif' }}>
    
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { sm: `calc(100% - ${isDesktop ? 240 : 0}px)` },
            ml: { md: `${isDesktop ? -10 : 0}px` },
            transition: theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {!isDesktop && (
            <Box sx={{ p: 2, alignSelf: 'flex-start' }}>
              <IconButton 
                color="inherit" 
                aria-label="open drawer" 
                edge="start" 
                onClick={toggleDrawer}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          )}

          <HeroSection sx={{ width: '100%' }}>
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
              <Typography 
                variant="h3" 
                align="center" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700, 
                  fontSize: { xs: '2rem', md: '3rem' },
                  textShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}
              >
                Welcome to Yummy Yard
              </Typography>
              <Typography 
                variant="h6" 
                align="center" 
                sx={{ 
                  maxWidth: '800px', 
                  mx: 'auto', 
                  opacity: 0.9,
                  mb: 4,
                  fontWeight: 300,
                  fontSize: { xs: '1rem', md: '1.25rem' },
                }}
              >
                Where every meal tells a story and every flavor creates a memory
              </Typography>
              
            </Container>
          </HeroSection>

          <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
            {/* About Us Section */}
            <Box sx={{ mb: 8 }}>
              <SectionTitle variant="h4" align="center" sx={{ fontWeight: 'bold', color: '#3dcd83' }}>
                About Us
              </SectionTitle>
              
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={6}>
                  <AboutUsImage src={aboutUsImage} alt="Yummy Yard dining experience" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                      We are an independent, family-run restaurant located in the heart of Galle, Sri Lanka. At Yummy Yard, we are passionate about sustainably sourced seafood and fresh, local ingredients. Our aim is to deliver the highest quality food and service in a relaxed, welcoming, yet vibrant environment.
                    </Typography>
                    <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                      Seafood lovers will adore our kitchen’s creative approach to ingredients. Our dishes are crafted to highlight the natural flavors of the ocean, with each variety paired with a particular garnish to “amplify and complement their specific natural flavor.”
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                      Our cozy restaurant keeps things unfussy yet classy, with warm wooden floors, soft lighting, and a welcoming ambiance that makes every visit a memorable one.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Contact Section */}
            <Box sx={{ mb: 8 }}>
              <SectionTitle variant="h4" align="center" sx={{ fontWeight: 'bold' }}>
                Contact Us
              </SectionTitle>
              
              <Grid container spacing={4} justifyContent="center">
                <Grid item xs={12} md={5}>
                  <StyledPaper>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#3dcd83', mb: 3 }}>
                      Get In Touch
                    </Typography>
                    
                    <ContactCard>
                      <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton sx={{ backgroundColor: '#3dcd83', color: 'white', mr: 2 }}>
                          <LocationIcon />
                        </IconButton>
                        <Box sx={{ textAlign: 'left' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Our Location
                          </Typography>
                          <Typography variant="body2">
                            No. 214A, Wakwella Road, Koggalakade Junction
                          </Typography>
                          <Typography variant="body2">
                            Galle, Sri Lanka
                          </Typography>
                        </Box>
                      </CardContent>
                    </ContactCard>
                    
                    <ContactCard>
                      <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton sx={{ backgroundColor: '#3dcd83', color: 'white', mr: 2 }}>
                          <PhoneIcon />
                        </IconButton>
                        <Box sx={{ textAlign: 'left' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Phone Number
                          </Typography>
                          <Typography variant="body2">
                            Reservations: +94 76 718 1695
                          </Typography>
                          <Typography variant="body2">
                            Customer Service: +94 76 123 4567
                          </Typography>
                        </Box>
                      </CardContent>
                    </ContactCard>
                    
                    <ContactCard>
                      <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton sx={{ backgroundColor: '#3dcd83', color: 'white', mr: 2 }}>
                          <EmailIcon />
                        </IconButton>
                        <Box sx={{ textAlign: 'left' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Email Address
                          </Typography>
                          <Typography variant="body2">
                            Reservations: bookings@yummyyard.com
                          </Typography>
                          <Typography variant="body2">
                            General Inquiries: info@yummyyard.com
                          </Typography>
                        </Box>
                      </CardContent>
                    </ContactCard>
                  </StyledPaper>
                </Grid>
                
                {/* <Grid item xs={12} md={7}>
                  <StyledPaper>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#3dcd83', mb: 3 }}>
                      Send us a Message
                    </Typography>
                    
                    <form onSubmit={handleSubmit}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Your Name"
                            name="name"
                            value={formData.name}
                            onChange={handleFormChange}
                            variant="outlined"
                            required
                            sx={{ mb: 2 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Your Email"
                            name="email"
                            value={formData.email}
                            onChange={handleFormChange}
                            variant="outlined"
                            type="email"
                            required
                            sx={{ mb: 2 }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Subject"
                            name="subject"
                            variant="outlined"
                            sx={{ mb: 2 }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Your Message"
                            name="message"
                            value={formData.message}
                            onChange={handleFormChange}
                            variant="outlined"
                            multiline
                            rows={6}
                            required
                            sx={{ mb: 3 }}
                          />
                        </Grid>
                        <Grid item xs={12} sx={{ textAlign: 'center' }}>
                          <Button 
                            type="submit"
                            variant="contained" 
                            sx={{ 
                              py: 1.5, 
                              px: 4, 
                              borderRadius: 2,
                              fontWeight: 600,
                              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                              backgroundColor: '#3dcd83',
                              '&:hover': {
                                backgroundColor: '#32b873',
                                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
                              }
                            }}
                            endIcon={<SendIcon />}
                          >
                            Send Message
                          </Button>
                        </Grid>
                      </Grid>
                    </form>
                  </StyledPaper>
                </Grid> */}
              </Grid>
            </Box>
            
            {/* Footer */}
            <Box 
              component="footer" 
              sx={{ 
                py: 6, 
                mt: 8,
                textAlign: 'center',
                borderTop: '1px solid rgba(0,0,0,0.1)',
                background: 'linear-gradient(to bottom, #f8faf9, #f0f2f1)',
                width: '100vw', // Ensure it spans the full viewport width
                marginLeft: '-50vw', // Center align by offsetting
                marginRight: '-50vw',
                position: 'relative',
                left: '50%',
                right: '50%',
                boxSizing: 'border-box',
              }}
            >
              <Container maxWidth="lg">
                <Grid container spacing={4} justifyContent="center">
                  <Grid item xs={12} md={4}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#3dcd83' }}>
                      Yummy Yard
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Experience the finest seafood in Galle, Sri Lanka. We're passionate about fresh, local ingredients and sustainable practices.
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#3dcd83' }}>
                      Opening Hours
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Monday to Friday: 11:00 AM - 10:00 PM
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Saturday & Sunday: 10:00 AM - 11:00 PM
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#3dcd83' }}>
                      Follow Us
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <SocialButton 
                    component={Link} 
                    href="https://www.facebook.com/people/Yummy-Yard/61565171879434/" 
                    target="_blank" 
                    rel="noopener"
                    aria-label="Facebook"
                  >
                    <FacebookIcon sx={{ color: 'white' }} />
                  </SocialButton>
                    </Box>
                  </Grid>
                </Grid>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
                  © {new Date().getFullYear()} Yummy Yard. All rights reserved.
                </Typography>
              </Container>
            </Box>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default AboutContact;