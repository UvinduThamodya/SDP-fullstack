import React, { useEffect, useState } from 'react';
import apiService from '../../services/api';
import { 
  Box, Container, Grid, Typography, Button, Card, CardMedia, 
  CardContent, Link, IconButton, Divider, Avatar, Rating, 
  Chip, Paper, Grow, useMediaQuery, alpha
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { 
  Facebook as FacebookIcon, 
  Phone as PhoneIcon, 
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Restaurant as RestaurantIcon,
  AccessTime as AccessTimeIcon,
  ArrowForward as ArrowForwardIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Import images for the slider
import bgImage1 from '../../assets/sliderimage1.jpg';
import bgImage2 from '../../assets/sliderimage2.jpg';
import bgImage3 from '../../assets/sliderimage3.jpg';

// Import restaurant logo for dishes (placeholder)
import restaurantLogo from '../../assets/YummyYard_logo.png';

// Import Navbar component
import Navbar from '../../components/Navbar';

import '@fontsource/poppins'; // Ensure this package is installed

// Styled Components for Reusability
const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: 'black',
  color: 'white',
  fontFamily: 'Runalto, sans-serif',
  padding: '10px 24px',
  borderRadius: '30px',
  fontWeight: 'bold',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha('#3ACA82', 0.8),
    transform: 'translateY(-3px)',
    boxShadow: '0 6px 12px rgba(58, 202, 130, 0.3)',
  },
}));

// Style for Runalto Font
const RunaltoTypography = styled(Typography)({
  fontFamily: 'Poppins, sans-serif', // Changed to Poppins
});

// Gradient Overlay for Images
const GradientOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'linear-gradient(rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 100%)',
  zIndex: 1,
}));

// Animation for Cards
const AnimatedCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#fff',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.4s ease',
  '&:hover': {
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
    transform: 'translateY(-8px)',
  }
}));

// Featured Dish Tag
const FeatureTag = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  right: 16,
  backgroundColor: '#3ACA82',
  color: 'black',
  fontWeight: 'bold',
  zIndex: 2,
}));

// Price Tag
const PriceTag = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 16,
  right: 16,
  backgroundColor: 'rgba(58, 202, 130, 0.8)',
  color: 'white',
  padding: '8px 16px',
  borderRadius: '20px',
  fontWeight: 'bold',
  zIndex: 2,
}));

// Section Title with animated underline
const SectionTitle = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(6),
  position: 'relative',
  '& .underline': {
    width: '80px',
    height: '3px',
    backgroundColor: '#3ACA82',
    margin: '0 auto',
    marginTop: theme.spacing(2),
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: '50%',
      bottom: 0,
      width: '30px',
      height: '3px',
      backgroundColor: '#3ACA82',
      transform: 'translateX(-50%)',
      animation: 'pulse 2s infinite',
    }
  },
  '@keyframes pulse': {
    '0%': {
      width: '30px',
    },
    '50%': {
      width: '60px',
    },
    '100%': {
      width: '30px',
    }
  }
}));

// Footer Styled Components
const FooterTitle = styled(Typography)(({ theme }) => ({
  fontFamily: 'Poppins, sans-serif', // Changed to Poppins
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
    backgroundColor: '#3ACA82',
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
    backgroundColor: '#3ACA82',
    transform: 'translateY(-3px)',
  }
}));

// Testimonial Card
const TestimonialCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '12px',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
  }
}));

const randomImages = [
  { src: require('../../assets/cooking1.png'), top: '10%', left: '5%' },
  { src: require('../../assets/cooking2.png'), top: '30%', left: '5%' },
  { src: require('../../assets/cooking3.png'), top: '50%', right: '5%' },
  { src: require('../../assets/cooking4.png'), top: '70%', right: '75%' },
  { src: require('../../assets/cooking5.png'), top: '18%', right: '4%' },
];

const Homepage = () => {
  // Initialize useNavigate hook
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  
  // State for animations
  const [showSpecials, setShowSpecials] = useState(false);
  
  useEffect(() => {
    // Show specials section with slight delay for animation
    const timer = setTimeout(() => {
      setShowSpecials(true);
    }, 500);
    
    // Load Facebook SDK
    const loadFacebookSDK = () => {
      window.fbAsyncInit = function() {
        window.FB.init({
          xfbml: true,
          version: 'v22.0',
        });
      };

      // Load the SDK asynchronously
      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "https://connect.facebook.net/en_GB/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    };

    loadFacebookSDK();
    
    // Clean up
    return () => {
      delete window.fbAsyncInit;
      clearTimeout(timer);
    };
  }, []);

  // Function to handle login button click
  const handleLoginClick = () => {
    console.log("Login button clicked");
    navigate('/login');
  };

  // Function to handle signup button click
  const handleSignupClick = () => {
    console.log("Register button clicked");
    navigate('/Register');
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
    pauseOnHover: false,
  };

  // Featured items slider settings
  const featuredItemsSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: isMobile ? 1 : isTablet ? 2 : 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: !isMobile,
    pauseOnHover: true,
  };

  // Testimonials slider settings
  const testimonialSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: isMobile ? 1 : 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: !isMobile,
  };

  const backgroundImages = [bgImage1, bgImage2, bgImage3];

  // Featured dishes data with improved descriptions
  const featuredDishes = [
    { 
      id: 1, 
      name: "Spicy Seafood Fusion", 
      price: "Rs.299", 
      image: restaurantLogo,
      featured: true,
      description: "A delightful blend of local spices with fresh seafood" 
    },
    { 
      id: 2, 
      name: "Tropical Chicken Grill", 
      price: "Rs.349", 
      image: restaurantLogo,
      featured: false,
      description: "Grilled chicken with tropical fruits and special sauce" 
    },
    { 
      id: 3, 
      name: "Vegetable Paradise", 
      price: "Rs.399", 
      image: restaurantLogo,
      featured: true,
      description: "Fresh garden vegetables with aromatic herbs" 
    },
    { 
      id: 4, 
      name: "Signature Rice Bowl", 
      price: "Rs.449", 
      image: restaurantLogo,
      featured: false,
      description: "Our special rice bowl with chef's secret recipe" 
    },
    { 
      id: 5, 
      name: "Island Dessert Platter", 
      price: "Rs.499", 
      image: restaurantLogo,
      featured: true,
      description: "Selection of local sweets with a modern twist" 
    },
  ];

  useEffect(() => {
    const fetchFavorites = async () => {
      setFavoritesLoading(true);
      const favs = await apiService.getFavorites();
      setFavorites(favs);
      setFavoritesLoading(false);
    };
    fetchFavorites();
  }, []);

  // Chef's specials
  const chefSpecials = [
    {
      id: 1,
      name: "Seafood Coconut Curry",
      description: "Delicate seafood simmered in rich coconut curry with local spices",
      price: "Rs.599",
      image: restaurantLogo,
    },
    {
      id: 2,
      name: "Royal Family Feast",
      description: "A traditional family platter with various delicacies and accompaniments",
      price: "Rs.1299",
      image: restaurantLogo,
    }
  ];

  // Testimonial data
  const testimonials = [
    {
      id: 1,
      name: "Sarah D.",
      avatar: null, // Use null for default avatar
      rating: 5,
      comment: "The food was absolutely amazing! Best dining experience I've had in Sri Lanka. The staff was very attentive and friendly too.",
      date: "March 2025"
    },
    {
      id: 2,
      name: "Michael T.",
      avatar: null,
      rating: 4.5,
      comment: "Excellent flavor combinations and beautiful presentation. The ambiance is perfect for both family dinners and special occasions.",
      date: "April 2025"
    },
    {
      id: 3,
      name: "Lakshmi P.",
      avatar: null,
      rating: 5,
      comment: "Authentic Sri Lankan flavors with a modern twist. I highly recommend the seafood dishes - simply outstanding!",
      date: "February 2025"
    }
  ];
  
  // Opening hours data
  const openingHours = [
    { day: "Monday - Friday", hours: "8:00 AM - 10:00 PM" },
    { day: "Saturday - Sunday", hours: "10:00 AM - 6:00 PM" },
    { day: "Public Holidays", hours: "10:00 AM - 4:00 PM" }
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      background: 'linear-gradient(to top, #e6e6e6, #bfbfbf)', // More ash gradient
      backgroundSize: 'cover', // Ensure the gradient covers the entire page
      backgroundRepeat: 'no-repeat', // Prevent tiling
      backgroundPosition: 'center', // Center the gradient
      // Responsive fix for mobile overflow
      overflowX: 'hidden',
    }}>
      {/* Random Cooking Images */}
      {randomImages.map((image, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            top: image.top,
            left: image.left || 'auto',
            right: image.right || 'auto',
            width: { xs: '120px', sm: '200px', md: '400px' },
            height: { xs: '120px', sm: '200px', md: '400px' },
            backgroundImage: `url(${image.src})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            zIndex: 0,
            opacity: { xs: 0.3, sm: 0.5, md: 0.8 },
            display: { xs: 'none', sm: 'block' }, // Hide on extra small screens
          }}
        />
      ))}

      {/* Facebook SDK root div */}
      <div id="fb-root"></div>
      
      {/* Navigation Bar */}
      <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 2 }}>
        <Navbar />
      </Box>

      {/* Hero Section with Background Slider */}
      <Box sx={{
        height: { xs: '70vh', sm: '100vh' },
        position: 'relative',
        overflow: 'hidden',
        marginTop: { xs: '60px', sm: '84px' }, // Responsive space below navbar
      }}>
        {/* Background Image Slider */}
        <Slider {...backgroundSliderSettings} style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}>
          {backgroundImages.map((image, index) => (
            <div key={index}>
              <Box
                sx={{
                  width: '100%',
                  height: { xs: '70vh', sm: '100vh' },
                  backgroundImage: `url(${image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                }}
              >
                <GradientOverlay />
              </Box>
            </div>
          ))}
        </Slider>

        {/* Hero Section Content */}
        <Box sx={{
          py: { xs: 4, sm: 10 },
          color: 'white',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
          height: { xs: 'calc(70vh - 60px)', sm: 'calc(100vh - 84px)' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Container>
            <Grid container spacing={3} alignItems="center" justifyContent="center">
              <Grid item xs={12} md={10} sx={{ mb: 4, textAlign: 'center' }}>
                <Grow in={true} timeout={1000}>
                  <Box>
                    <RunaltoTypography variant="h2" component="h1" gutterBottom 
                      sx={{ 
                        fontWeight: 'bold', 
                        fontSize: { xs: '2rem', sm: '3.5rem', md: '4.5rem' },
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                        letterSpacing: '1px',
                      }}>
                      Welcome to an Island of Flavors
                    </RunaltoTypography>
                    <RunaltoTypography variant="h6" paragraph 
                      sx={{ 
                        fontSize: { xs: '1rem', sm: '1.3rem', md: '1.5rem' },
                        maxWidth: '800px',
                        margin: '0 auto',
                        marginBottom: 4,
                        opacity: 0.9
                      }}>
                      Experience authentic Sri Lankan cuisine with a modern twist
                    </RunaltoTypography>
                    
                    <Grid container spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                      <Grid item>
                        <StyledButton 
                          variant="contained" 
                          size="large"
                          onClick={() => navigate('/menu')}
                          endIcon={<ArrowForwardIcon />}
                        >
                          Explore Our Menu
                        </StyledButton>
                      </Grid>
                    </Grid>
                  </Box>
                </Grow>
              </Grid>
            </Grid>
          </Container>
        </Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: '10%', sm: '20%' },
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            zIndex: 2,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
              mb: 1,
              fontSize: { xs: '1.1rem', sm: '1.5rem' }
            }}
          >
            Explore
          </Typography>
          <Box
            sx={{
              width: 0,
              height: 0,
              borderLeft: { xs: '10px solid transparent', sm: '15px solid transparent' },
              borderRight: { xs: '10px solid transparent', sm: '15px solid transparent' },
              borderTop: { xs: '14px solid white', sm: '20px solid white' },
              margin: '0 auto',
            }}
          />
        </Box>
      </Box>

      {/* Featured Items with Slider */}
      <Container sx={{ py: { xs: 6, md: 10 } }}>
  <SectionTitle>
    <RunaltoTypography variant="subtitle1" align="center" color="#3ACA82"
      sx={{
        fontSize: '1.25rem',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        fontWeight: 'bold'
      }}>
      Your Favorites
    </RunaltoTypography>
    <RunaltoTypography variant="h3" component="h2" align="center"
      sx={{
        fontWeight: 'bold',
        color: 'black', // Changed to black
        fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
        margin: '8px 0'
      }}>
      {favorites.length > 0 ? "Favorite Dishes" : "No Favorites Yet"}
    </RunaltoTypography>
    <div className="underline"></div>
  </SectionTitle>
  <Box sx={{ my: 6 }}>
    {favoritesLoading ? (
      <Typography color="text.secondary" align="center">Loading favorites...</Typography>
    ) : favorites.length > 0 ? (
      <Grid container spacing={3}>
        {favorites.map((dish) => (
          <Grid item xs={12} sm={6} md={4} key={dish.item_id}>
            <AnimatedCard>
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  image={dish.image_url || restaurantLogo}
                  alt={dish.name}
                  sx={{
                    height: 220,
                    objectFit: 'cover',
                    objectPosition: 'center', // Centers the image content
                    margin: '0 auto', // Centers the image container
                  }}
                />
                <PriceTag>{dish.price}</PriceTag>
              </Box>
              <CardContent sx={{ textAlign: 'center', flexGrow: 1 }}>
                <RunaltoTypography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                  {dish.name}
                </RunaltoTypography>
                <RunaltoTypography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {dish.description}
                </RunaltoTypography>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  sx={{
                    borderRadius: '20px',
                    borderColor: '#3ACA82',
                    color: '#3ACA82',
                    '&:hover': {
                      backgroundColor: '#3ACA82',
                      color: 'black'
                    }
                  }}
                  onClick={() => navigate('/menu')} 
                >
                  Order Now
                </Button>
              </CardContent>
            </AnimatedCard>
          </Grid>
        ))}
      </Grid>
    ) : (
      <Typography color="text.secondary" align="center" fontSize="1.5rem" sx={{ mt: 4 }} fontWeight={'bold'}>
        You have not added any favorites yet.
      </Typography>
    )}
  </Box>
</Container>

      {/* Features Section */}
      <Container sx={{ py: { xs: 6, md: 10 } }}>
        <SectionTitle>
          <RunaltoTypography variant="subtitle1" align="center" color="#3ACA82" 
            sx={{ 
              fontSize: '1.25rem', 
              letterSpacing: '2px', 
              textTransform: 'uppercase',
              fontWeight: 'bold'
            }}>
            Why Choose Us
          </RunaltoTypography>
          <RunaltoTypography variant="h3" component="h2" align="center" 
            sx={{ 
              fontWeight: 'bold', 
              color: 'black', // Changed to black
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              margin: '8px 0'
            }}>
            Our Features
          </RunaltoTypography>
          <div className="underline"></div>
        </SectionTitle> 

        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} sm={4}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 4, 
                textAlign: 'center', 
                borderRadius: '16px', 
                backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                backdropFilter: 'blur(10px)', 
                border: '1px solid rgba(255, 255, 255, 0.1)' 
              }}
            >
              <Box 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  mx: 'auto', 
                  mb: 2, 
                  backgroundColor: '#E8F5E9', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <RestaurantIcon sx={{ fontSize: 40, color: '#3ACA82' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'black' }}>
                Easy To Order
              </Typography>
              <Typography variant="body2" sx={{ color: 'black' }}>
                Place your order effortlessly with our user-friendly platform.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 4, 
                textAlign: 'center', 
                borderRadius: '16px', 
                backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                backdropFilter: 'blur(10px)', 
                border: '1px solid rgba(255, 255, 255, 0.1)' 
              }}
            >
              <Box 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  mx: 'auto', 
                  mb: 2, 
                  backgroundColor: '#E8F5E9', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <AccessTimeIcon sx={{ fontSize: 40, color: '#3ACA82' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'balck' }}>
                Fastest Delivery
              </Typography>
              <Typography variant="body2" sx={{ color: 'black' }}>
                Customers ordering through this website receive our priority service.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 4, 
                textAlign: 'center', 
                borderRadius: '16px', 
                backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                backdropFilter: 'blur(10px)', 
                border: '1px solid rgba(255, 255, 255, 0.1)' 
              }}
            >
              <Box 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  mx: 'auto', 
                  mb: 2, 
                  backgroundColor: '#E8F5E9', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <StarIcon sx={{ fontSize: 40, color: '#3ACA82' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'black' }}>
                Best Quality
              </Typography>
              <Typography variant="body2" sx={{ color: 'black' }}>
                Relish the finest quality meals prepared with care.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Opening Hours Section - Moved */}
      <Container sx={{ py: { xs: 6, md: 8 }, textAlign: 'center' }}>
        <Grid container spacing={4} alignItems="center" justifyContent="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              backgroundColor: 'rgba(58, 202, 130, 0.1)', 
              borderRadius: '16px',
              p: 4,
              border: '1px solid rgba(58, 202, 130, 0.3)',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'center' }}>
                <AccessTimeIcon sx={{ color: '#3ACA82', fontSize: 36, mr: 2 }} />
                <RunaltoTypography variant="h4" component="h2" color="black" // Changed to black
                  sx={{ fontWeight: 'bold' }}>
                  Opening Hours
                </RunaltoTypography>
              </Box>
              
              <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)', my: 2 }} />
              
              {openingHours.map((schedule, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <RunaltoTypography variant="h6" color="white" sx={{ fontWeight: 'bold' }}>
                    {schedule.day}
                  </RunaltoTypography>
                  <RunaltoTypography variant="body1" color="#3ACA82">
                    {schedule.hours}
                  </RunaltoTypography>
                  {index < openingHours.length - 1 && (
                    <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)', my: 2 }} />
                  )}
                </Box>
              ))}
              
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Chef's Recommendations */}
      <Box sx={{ 
        py: { xs: 4, md: 10 }, 
        backgroundColor: 'rgba(0, 0, 0, 0.7)', 
        color: 'white',
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9))',
      }}>
        <Container>
          <SectionTitle>
            <RunaltoTypography variant="subtitle1" align="center" color="#3ACA82" 
              sx={{ 
                fontSize: '1.25rem', 
                letterSpacing: '2px', 
                textTransform: 'uppercase',
                fontWeight: 'bold'
              }}>
              Special Selection
            </RunaltoTypography>
            <RunaltoTypography variant="h3" component="h2" align="center" 
              sx={{ 
                fontWeight: 'bold', 
                color: 'white', 
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                margin: '8px 0'
              }}>
              Chef's Recommendations
            </RunaltoTypography>
            <div className="underline"></div>
          </SectionTitle>
          
          <Grid container spacing={4} justifyContent="center" sx={{ mt: 2 }}>
            {chefSpecials.map((special, index) => (
              <Grid item xs={12} md={6} key={special.id}>
                <Grow in={showSpecials} timeout={1000 + (index * 500)}>
                  <Paper sx={{ 
                    p: 3, 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: 'center',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
                    }
                  }}>
                    <Box 
                      sx={{ 
                        width: { xs: '100%', sm: '40%' }, 
                        mb: { xs: 2, sm: 0 }, 
                        mr: { xs: 0, sm: 3 },
                        borderRadius: '12px',
                        overflow: 'hidden'
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={special.image}
                        alt={special.name}
                        sx={{ 
                          height: { xs: 180, sm: 200 },
                          width: '100%',
                          objectFit: 'cover',
                          borderRadius: '12px',
                        }}
                      />
                    </Box>
                    <Box sx={{ width: { xs: '100%', sm: '60%' }, textAlign: { xs: 'center', sm: 'left' } }}>
                      <RunaltoTypography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {special.name}
                      </RunaltoTypography>
                      <RunaltoTypography variant="body1" paragraph sx={{ opacity: 0.9 }}>
                        {special.description}
                      </RunaltoTypography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                        <RunaltoTypography variant="h6" color="#3ACA82" sx={{ fontWeight: 'bold', mr: 2 }}>
                          {special.price}
                        </RunaltoTypography>
                        <Button 
                          variant="contained" 
                          sx={{ 
                            backgroundColor: '#3ACA82', 
                            color: 'black',
                            '&:hover': {
                              backgroundColor: alpha('#3ACA82', 0.8),
                            }
                          }}
                        >
                          Order Special
                        </Button>
                      </Box>
                    </Box>
                  </Paper>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ 
        py: { xs: 4, md: 10 }, 
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5))',
      }}>
        <Container>
          <SectionTitle>
            <RunaltoTypography variant="subtitle1" align="center" color="#3ACA82" 
              sx={{ 
                fontSize: '1.25rem', 
                letterSpacing: '2px', 
                textTransform: 'uppercase',
                fontWeight: 'bold'
              }}>
              Google Reviews
            </RunaltoTypography>
            <RunaltoTypography variant="h3" component="h2" align="center" 
              sx={{ 
                fontWeight: 'bold', 
                color: 'white', 
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                margin: '8px 0'
              }}>
              What Our Customers Say
            </RunaltoTypography>
            <div className="underline"></div>
          </SectionTitle>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <StyledButton 
              variant="contained" 
              component="a" 
              href="https://maps.app.goo.gl/oUCuGsg6ZQtdSAaZ9" 
              target="_blank"
              startIcon={<img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google Icon" style={{ width: 20, height: 20 }} />}
            >
              Open in Google Maps
            </StyledButton>
          </Box>
        </Container>
      </Box>

      {/* Social Media Updates */}
      <Container sx={{ py: { xs: 4, md: 10 } }}>
        <SectionTitle>
          <RunaltoTypography variant="subtitle1" align="center" color="#3ACA82" 
            sx={{ 
              fontSize: '1.25rem', 
              letterSpacing: '2px', 
              textTransform: 'uppercase',
              fontWeight: 'bold'
            }}>
            Stay Connected
          </RunaltoTypography>
          <RunaltoTypography variant="h3" component="h2" align="center" 
            sx={{ 
              fontWeight: 'bold', 
              color: 'black', // Changed to black
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              margin: '8px 0'
            }}>
            Social Media Updates
          </RunaltoTypography>
          <div className="underline"></div>
        </SectionTitle>
        
        <RunaltoTypography variant="subtitle1" align="center" color="black" paragraph sx={{ opacity: 0.8, mb: 4 }}>
          Follow us on social media for the latest news, promotions, and behind-the-scenes content
        </RunaltoTypography>
        
        {/* Facebook Page Plugin with enhanced styling */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          gap: 4,
        }}>
          <Box sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            p: 2,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            width: { xs: '100%', md: '500px' },
            height: { xs: '300px', md: '500px' },
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            mb: { xs: 2, md: 0 }
          }}>
            <iframe 
              src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fpeople%2FYummy-Yard%2F61565171879434%2F&show_posts=true&width=500&height=500&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true" 
              width="100%" 
              height="100%" 
              style={{ border: 'none', overflow: 'hidden', borderRadius: '8px' }} 
              scrolling="no" 
              frameBorder="0" 
              allowFullScreen={true} 
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              title="Yummy Yard Facebook Feed"
            />
          </Box>
          
          <Box sx={{ 
            textAlign: { xs: 'center', md: 'left' },
            maxWidth: { xs: '100%', md: '400px' }
          }}>
            <RunaltoTypography variant="h4" component="h3" color="black" // Changed to black
              sx={{ mb: 2, fontWeight: 'bold' }}>
              Never Miss an Update
            </RunaltoTypography>
            <RunaltoTypography variant="body1" color="black" paragraph sx={{ opacity: 0.8 }}>
              Follow us on Facebook to stay informed about special events, new menu items, and exclusive offers. Join our community of food lovers!
            </RunaltoTypography>
            
            <Box sx={{ mt: 4 }}>
              <StyledButton 
                variant="contained" 
                component="a" 
                href="https://www.facebook.com/people/Yummy-Yard/61565171879434/" 
                target="_blank"
                startIcon={<FacebookIcon />}
                size="large"
                sx={{ 
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem'
                }}
              >
                Follow Us on Facebook
              </StyledButton>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Call to Action Section - NEW */}
      <Box sx={{ 
        py: { xs: 4, md: 8 }, 
        backgroundColor: 'rgba(58, 202, 130, 0.1)',
        borderTop: '1px solid rgba(58, 202, 130, 0.2)',
        borderBottom: '1px solid rgba(58, 202, 130, 0.2)',
      }}>
        <Container>
          <Grid container spacing={4} alignItems="center" justifyContent="center">
            <Grid item xs={12} md={8} textAlign="center">
              <RunaltoTypography variant="h4" component="h2" color="black" // Changed to black
                sx={{ fontWeight: 'bold', mb: 2 }}>
                Ready to Experience Our Flavors?
              </RunaltoTypography>
              
              <Grid container spacing={2} justifyContent="center">
                <Grid item>
                  <StyledButton 
                    variant="outlined" 
                    size="large"
                    sx={{ 
                      borderColor: 'white', 
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                    onClick={() => navigate('/menu')}
                  >
                    Order Online
                  </StyledButton>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer Section - Enhanced */}
      <Box sx={{ 
        backgroundColor: '#121212',
        color: '#fff',
        padding: { xs: '40px 0 24px', md: '60px 0 32px' },
        position: 'relative',
        zIndex: 1,
        fontFamily: 'Runalto, sans-serif',
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 1))',
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
                  sx={{ color: '#3ACA82', mr: 2, backgroundColor: 'rgba(58, 202, 130, 0.1)' }}
                >
                  <LocationIcon />
                </IconButton>
                <Box>
                  <Typography variant="body2" sx={{ fontFamily: 'Runalto, sans-serif', mb: 0.5 }}>
                    <strong>Address:</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, fontFamily: 'Runalto, sans-serif' }}>
                    Koggalakade Junction, No. 214A Wakwella Rd, Galle 80000
                  </Typography>
                </Box>
              </ContactItem>
              <ContactItem>
                <IconButton 
                  size="small" 
                  sx={{ color: '#3ACA82', mr: 2, backgroundColor: 'rgba(58, 202, 130, 0.1)' }}
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
                  sx={{ color: '#3ACA82', mr: 2, backgroundColor: 'rgba(58, 202, 130, 0.1)' }}
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
                  borderRadius: '12px',
                  border: '2px solid rgba(58, 202, 130, 0.3)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
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

//#3ACA82