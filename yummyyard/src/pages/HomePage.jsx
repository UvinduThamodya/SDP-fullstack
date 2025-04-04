
import React from 'react';
import { Box, Container, Grid, Typography, Button, Card, CardMedia, CardContent, Link, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { 
  Facebook as FacebookIcon, 
  Phone as PhoneIcon, 
  LocationOn as LocationIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook

// Import images for the slider
import bgImage1 from '../assets/sliderimage1.jpg';
import bgImage2 from '../assets/sliderimage2.jpg';
import bgImage3 from '../assets/sliderimage3.jpg';

// Import restaurant logo for dishes (placeholder)
import restaurantLogo from '../assets/YummyYard_logo.png'; // Replace with your actual logo path

// Import social media images
import foodieJenny from '../assets/foodie-jenny.jpg';
import eatsWithSam from '../assets/eats-with-sam.jpg';
import Navbar from '../components/Navbar'; // Import the Navbar component

// Styled Components for Reusability
const StyledButton = styled(Button)({
  backgroundColor: 'black',
  color: 'white',
  fontFamily: 'Runalto, sans-serif', // Apply Runalto font
  '&:hover': {
    backgroundColor: 'grey',
  },
});

// Style for Runalto Font
const RunaltoTypography = styled(Typography)({
  fontFamily: 'Runalto, sans-serif',
});

// Footer Styled Components
const FooterTitle = styled(Typography)(({ theme }) => ({
  fontFamily: 'Runalto, sans-serif',
  fontWeight: 'bold',
  marginBottom: theme.spacing(3),
  position: 'relative',
  paddingBottom: theme.spacing(1),
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 80,
    height: 3,
    backgroundColor: '#d4af37',
  }
}));

const ContactItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  marginRight: theme.spacing(1),
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#d4af37',
    transform: 'translateY(-3px)',
  }
}));

const Homepage = () => {
  // Initialize useNavigate hook
  const navigate = useNavigate();

  // Function to handle login button click
  const handleLoginClick = () => {
    console.log("Login button clicked");
    navigate('/login'); // Navigate to the login page
  };

  // Function to handle signup button click
  const handleSignupClick = () => {
    console.log("Register button clicked");
    navigate('/Register'); // Navigate to the signup page
  };

  // Background image slider settings
  const backgroundSliderSettings = {
    dots: false,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    fade: true,
  };

  // Featured items slider settings
  const featuredItemsSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  const backgroundImages = [bgImage1, bgImage2, bgImage3]; // Array of background images

  // Featured dishes data (with placeholder names 1-5)
  const featuredDishes = [
    { id: 1, name: "Dish 1", price: "Rs.299", image: restaurantLogo },
    { id: 2, name: "Dish 2", price: "Rs.349", image: restaurantLogo },
    { id: 3, name: "Dish 3", price: "Rs.399", image: restaurantLogo },
    { id: 4, name: "Dish 4", price: "Rs.449", image: restaurantLogo },
    { id: 5, name: "Dish 5", price: "Rs.499", image: restaurantLogo },
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      backgroundColor: '#000', // Dark background for rest of page
    }}>
      {/* Hero Section with Background Slider */}
      <Box sx={{
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background Image Slider */}
        <Slider {...backgroundSliderSettings} style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0, // Place behind all other content
        }}>
          {backgroundImages.map((image, index) => (
            <div key={index}>
              <Box
                sx={{
                  width: '100%',
                  height: '100vh',
                  backgroundImage: `url(${image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  '&:before': {  // Black overlay
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',  // Adjust alpha for desired shade
                  },
                }}
              />
            </div>
          ))}
        </Slider>

        {/* Navigation Bar */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Navbar />
        </Box>

        {/* Hero Section */}
        <Box sx={{
          py: 10, // Reduced padding to move upwards
          color: 'white',
          textAlign: 'center',
          position: 'relative', 
          zIndex: 1,
          height: 'calc(100vh - 64px)', // Adjust based on your navbar height
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center', // Center content horizontally
        }}>
          <Container>
            <Grid container spacing={3} alignItems="center" justifyContent="center"> {/* Center content horizontally */}
              <Grid item xs={12} md={8} sx={{ mb: 4, textAlign: 'center' }}> {/* Center content horizontally */}
                <RunaltoTypography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', fontSize: '4rem' }}> {/* Increased font size */}
                  Welcome to an Island of Flavors
                </RunaltoTypography>
                <RunaltoTypography variant="h6" paragraph sx={{ fontSize: '1.5rem' }}> {/* Increased font size */}
                  Enjoy delicious meals and a great dining experience.
                </RunaltoTypography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}> {/* Increased gap */}
                  <StyledButton 
                    variant="contained" 
                    sx={{ fontSize: '1.25rem', padding: '1rem 2rem' }}
                    onClick={handleLoginClick} // Add onClick handler
                  > 
                    Login
                  </StyledButton>
                  <StyledButton 
                    variant="contained" 
                    sx={{ fontSize: '1.25rem', padding: '1rem 2rem' }}
                    onClick={handleSignupClick} // Add onClick handler
                  > 
                    Sign Up
                  </StyledButton>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>

      {/* Featured Items with Slider */}
      <Container sx={{ py: 6 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <RunaltoTypography variant="subtitle1" align="center" color="#d4af37" paragraph sx={{ fontSize: '1.25rem' }}>
            Popular Dishes
          </RunaltoTypography>
          <RunaltoTypography variant="h3" component="h2" align="center" gutterBottom sx={{ fontWeight: 'bold', color: 'white', fontSize: '2.5rem' }}>
            Our Delicious Food
          </RunaltoTypography>
        </Box>
        
        {/* Featured Items Slider */}
        <Box sx={{ my: 4 }}>
          <Slider {...featuredItemsSettings}>
            {featuredDishes.map((dish) => (
              <Box key={dish.id} sx={{ px: 1 }}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                    transform: 'translateY(-5px)',
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  }
                }}>
                  <CardMedia
                    component="img"
                    image={dish.image}
                    alt={dish.name}
                    sx={{ 
                      height: 220,
                      objectFit: 'cover',
                    }}
                  />
                  <CardContent sx={{ textAlign: 'center' }}>
                    <RunaltoTypography gutterBottom variant="h6" component="div">
                      {dish.name}
                    </RunaltoTypography>
                    <RunaltoTypography variant="subtitle1" color="#d4af37" sx={{ fontWeight: 'bold' }}>
                      {dish.price}
                    </RunaltoTypography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Slider>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <StyledButton variant="contained">View All Menu</StyledButton>
        </Box>
      </Container>

      {/* Chef's Recommendations */}
      <Box sx={{ py: 4, textAlign: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', color: 'white' }}>
        <Container>
          <RunaltoTypography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Chef's Recommendations
          </RunaltoTypography>
          <RunaltoTypography variant="subtitle1" paragraph>
            Discover special dishes handpicked by our chef
          </RunaltoTypography>
          <Button variant="outlined" color="inherit" style={{fontFamily: 'Runalto, sans-serif'}}>View Recommendations</Button>
        </Container>
      </Box>

      {/* Social Media Updates */}
      <Container sx={{ py: 6 }}>
        <RunaltoTypography variant="h4" component="h2" align="center" gutterBottom sx={{ fontWeight: 'bold', color: 'white' }}>
          Social Media Updates
        </RunaltoTypography>
        <RunaltoTypography variant="subtitle1" align="center" color="white" paragraph>
          Follow us on social media for the latest news
        </RunaltoTypography>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <StyledButton variant="contained">Follow Us</StyledButton>
        </Box>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {/* Foodie Jenny */}
          <Grid item xs={12} sm={6}>
            <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
              <CardContent>
                <RunaltoTypography variant="subtitle2" gutterBottom>
                  Foodie.Jenny
                </RunaltoTypography>
                <CardMedia
                  component="img"
                  image={foodieJenny}
                  alt="Foodie Jenny"
                />
                <RunaltoTypography variant="body2">
                  Just had an amazing meal at @Yummy Yard! Highly recommended.
                </RunaltoTypography>
              </CardContent>
            </Card>
          </Grid>
          {/* Eats With Sam */}
          <Grid item xs={12} sm={6}>
            <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
              <CardContent>
                <RunaltoTypography variant="subtitle2" gutterBottom>
                  EatsWithSam
                </RunaltoTypography>
                <CardMedia
                  component="img"
                  image={eatsWithSam}
                  alt="Eats With Sam"
                />
                <RunaltoTypography variant="body2">
                  Loved the dessert selection at Yummy Yard! Must try!
                </RunaltoTypography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Footer Section - REPLACING the Contact Us section */}
      <Box sx={{ 
        backgroundColor: '#121212',
        color: '#fff',
        padding: '48px 0 32px',
        position: 'relative',
        zIndex: 1,
        fontFamily: 'Runalto, sans-serif',
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Contact Information */}
            <Grid item xs={12} md={5}>
              <FooterTitle variant="h5">
                Contact Us
              </FooterTitle>
              
              <ContactItem>
                <IconButton 
                  size="small" 
                  sx={{ color: '#d4af37', mr: 2, backgroundColor: 'rgba(212, 175, 55, 0.1)' }}
                >
                  <LocationIcon />
                </IconButton>
                <Box>
                  <Typography variant="body2" sx={{ fontFamily: 'Runalto, sans-serif', mb: 0.5 }}>
                    <strong>Address:</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, fontFamily: 'Runalto, sans-serif' }}>
                    123 Yummy Street, Matara, Sri Lanka
                  </Typography>
                </Box>
              </ContactItem>
              <ContactItem>
                <IconButton 
                  size="small" 
                  sx={{ color: '#d4af37', mr: 2, backgroundColor: 'rgba(212, 175, 55, 0.1)' }}
                >
                  <PhoneIcon />
                </IconButton>
                <Box>
                  <Typography variant="body2" sx={{ fontFamily: 'Runalto, sans-serif', mb: 0.5 }}>
                    <strong>Phone:</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, fontFamily: 'Runalto, sans-serif' }}>
                    +94 76 718 1695
                  </Typography>
                </Box>
              </ContactItem>
              
              <ContactItem>
                <IconButton 
                  size="small" 
                  sx={{ color: '#d4af37', mr: 2, backgroundColor: 'rgba(212, 175, 55, 0.1)' }}
                >
                  <EmailIcon />
                </IconButton>
                <Box>
                  <Typography variant="body2" sx={{ fontFamily: 'Runalto, sans-serif', mb: 0.5 }}>
                    <strong>Email:</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, fontFamily: 'Runalto, sans-serif' }}>
                    info@yummyyard.com
                  </Typography>
                </Box>
              </ContactItem>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" sx={{ fontFamily: 'Runalto, sans-serif', mb: 1.5 }}>
                  <strong>Follow Us:</strong>
                </Typography>
                <Box>
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
              </Box>
            </Grid>
            
            {/* Map */}
            <Grid item xs={12} md={7}>
              <FooterTitle variant="h5">
                Our Location
              </FooterTitle>
              
              <Box 
                sx={{ 
                  width: '100%', 
                  height: '250px',
                  overflow: 'hidden',
                  borderRadius: 1,
                  border: '2px solid rgba(212, 175, 55, 0.3)',
                }}
              >
                <iframe 
                  src="https://maps.google.com/maps?q=6.0440402086493235,80.2140692146009&z=15&output=embed" 
                  width="100%" 
                  height="250" 
                  style={{ border: 0 }} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Restaurant Location"
                />
              </Box>
            </Grid>
          </Grid>
          
          <Box
            sx={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: 3,
              marginTop: 4,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" sx={{ opacity: 0.7, fontFamily: 'Runalto, sans-serif' }}>
              &copy; {new Date().getFullYear()} Yummy Yard. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Homepage;