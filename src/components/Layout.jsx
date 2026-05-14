import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Divider,
    Avatar,
    IconButton,
    AppBar,
    Toolbar,
    Menu,
    MenuItem,
    Tooltip,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    ReceiptLong,
    AddCircle,
    Psychology,
    Logout,
    Savings,
    LightMode,
    DarkMode,
    Menu as MenuIcon,
    Settings,
    Person,
    ChevronLeft,
    Category,
    People,
} from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import { useThemeMode } from '../theme.jsx';

const drawerWidth = 280;
const miniDrawerWidth = 80; // Width when collapsed

const Layout = ({ children }) => {
    const { logout, user } = useAuth();
    const { mode, toggleTheme } = useThemeMode();
    const location = useLocation();
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

    // Sidebar State - Start closed to prevent mobile flash/backdrop issues
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    // Profile Menu State
    const [anchorEl, setAnchorEl] = React.useState(null);
    const openMenu = Boolean(anchorEl);

    // Auto-expand sidebar on desktop on init
    React.useEffect(() => {
        if (isDesktop) {
            setSidebarOpen(true);
        }
    }, [isDesktop]);

    const handleSidebarToggle = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleProfileClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleProfileClose();
        logout();
    };

    const menuItems = [
        { text: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
        { text: 'Transactions', path: '/add', icon: ReceiptLong },
        { text: 'Analysis', path: '/analysis', icon: Savings, adminOnly: true },
        { text: 'Categories', path: '/categories', icon: Category, adminOnly: true },
        { text: 'AI Lab', path: '/ai-lab', icon: Psychology },
        { text: 'User Management', path: '/users', icon: People, adminOnly: true },
    ];

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
            {/* Logo / Header Area */}
            <Box sx={{
                height: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: sidebarOpen || !isDesktop ? 'space-between' : 'center',
                px: sidebarOpen || !isDesktop ? 2 : 1
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                        sx={{
                            bgcolor: 'primary.main',
                            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                            fontWeight: 700,
                            width: 32,
                            height: 32
                        }}
                    >
                        <Savings sx={{ fontSize: 18 }} />
                    </Avatar>
                    {(sidebarOpen || !isDesktop) && (
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 700,
                                background: 'linear-gradient(to right, #818cf8, #f472b6)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            SavvySave
                        </Typography>
                    )}
                </Box>
            </Box>

            <List sx={{ px: 1.5, py: 2 }}>
                {menuItems.map((item) => {
                    // Skip admin-only items if user is not admin
                    if (item.adminOnly && !user?.is_admin) {
                        return null;
                    }

                    const isActive = location.pathname === item.path;
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 1, display: 'block' }}>
                            <ListItemButton
                                component={Link}
                                to={item.path}
                                selected={isActive}
                                onClick={() => {
                                    if (!isDesktop) {
                                        handleSidebarToggle();
                                    }
                                }}
                                sx={{
                                    minHeight: 48,
                                    justifyContent: sidebarOpen || !isDesktop ? 'initial' : 'center',
                                    borderRadius: 2,
                                    px: 2,
                                    py: 1.5,
                                    '&.Mui-selected': {
                                        bgcolor: 'primary.main',
                                        color: 'primary.contrastText',
                                        '&:hover': {
                                            bgcolor: 'primary.dark',
                                        },
                                        '& .MuiListItemIcon-root': {
                                            color: 'inherit',
                                        },
                                    },
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        color: isActive ? 'inherit' : 'text.secondary',
                                        minWidth: 0,
                                        mr: sidebarOpen || !isDesktop ? 2 : 0,
                                        justifyContent: 'center'
                                    }}
                                >
                                    <item.icon />
                                </ListItemIcon>
                                {(sidebarOpen || !isDesktop) && (
                                    <ListItemText
                                        primary={item.text}
                                        primaryTypographyProps={{
                                            fontWeight: isActive ? 600 : 500,
                                            fontSize: '0.9rem',
                                            whiteSpace: 'nowrap',
                                            opacity: sidebarOpen || !isDesktop ? 1 : 0
                                        }}
                                    />
                                )}
                            </ListItemButton>
                        </ListItem>
                    );
                })}
                <ListItem disablePadding sx={{ mb: 1, display: 'block' }}>
                    <ListItemButton
                        component={Link}
                        to="/profile"
                        selected={location.pathname === '/profile'}
                        onClick={() => {
                            if (!isDesktop) {
                                handleSidebarToggle();
                            }
                        }}
                        sx={{
                            minHeight: 48,
                            justifyContent: sidebarOpen || !isDesktop ? 'initial' : 'center',
                            borderRadius: 2,
                            px: 2,
                            py: 1.5,
                            '&.Mui-selected': {
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                '&:hover': {
                                    bgcolor: 'primary.dark',
                                },
                                '& .MuiListItemIcon-root': {
                                    color: 'inherit',
                                },
                            },
                            '&:hover': {
                                bgcolor: 'action.hover',
                            },
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                color: location.pathname === '/profile' ? 'inherit' : 'text.secondary',
                                minWidth: 0,
                                mr: sidebarOpen || !isDesktop ? 2 : 0,
                                justifyContent: 'center'
                            }}
                        >
                            <Person />
                        </ListItemIcon>
                        {(sidebarOpen || !isDesktop) && (
                            <ListItemText
                                primary="Profile"
                                primaryTypographyProps={{
                                    fontWeight: location.pathname === '/profile' ? 600 : 500,
                                    fontSize: '0.9rem',
                                    whiteSpace: 'nowrap',
                                    opacity: sidebarOpen || !isDesktop ? 1 : 0
                                }}
                            />
                        )}
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding sx={{ mb: 1, display: 'block' }}>
                    <ListItemButton
                        onClick={logout}
                        sx={{
                            minHeight: 48,
                            justifyContent: sidebarOpen || !isDesktop ? 'initial' : 'center',
                            borderRadius: 2,
                            px: 2,
                            py: 1.5,
                            color: 'error.main',
                            '&:hover': {
                                bgcolor: 'action.hover',
                            },
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                color: 'error.main',
                                minWidth: 0,
                                mr: sidebarOpen || !isDesktop ? 2 : 0,
                                justifyContent: 'center'
                            }}
                        >
                            <Logout />
                        </ListItemIcon>
                        {(sidebarOpen || !isDesktop) && (
                            <ListItemText
                                primary="Logout"
                                primaryTypographyProps={{
                                    fontWeight: 500,
                                    fontSize: '0.9rem',
                                    whiteSpace: 'nowrap',
                                    opacity: sidebarOpen || !isDesktop ? 1 : 0
                                }}
                            />
                        )}
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
            {/* Topbar */}
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    backdropFilter: 'blur(20px)',
                    background: mode === 'dark'
                        ? 'rgba(15, 23, 42, 0.8)'
                        : 'rgba(255, 255, 255, 0.8)',
                    width: { xs: '100%', md: `calc(100% - ${sidebarOpen ? drawerWidth : miniDrawerWidth}px)` },
                    ml: { xs: 0, md: `${sidebarOpen ? drawerWidth : miniDrawerWidth}px` },
                    transition: theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                    pointerEvents: 'auto'
                }}
            >
                <Toolbar sx={{ height: 64 }}>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleSidebarToggle}
                        sx={{ mr: 2, borderRadius: 1.5 }}
                    >
                        {sidebarOpen && isDesktop ? <ChevronLeft /> : <MenuIcon />}
                    </IconButton>

                    {/* Left side spacer or Breadcrumbs could go here */}
                    <Box sx={{ flexGrow: 1 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title="Toggle Theme">
                            <IconButton onClick={toggleTheme} color="inherit" sx={{ borderRadius: 1.5 }}>
                                {mode === 'dark' ? <LightMode /> : <DarkMode />}
                            </IconButton>
                        </Tooltip>

                        <Divider orientation="vertical" flexItem variant="middle" sx={{ mx: 1, height: 24, my: 'auto' }} />

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', p: 0.5, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }} onClick={handleProfileClick}>
                            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>{user?.name || 'User'}</Typography>

                            </Box>
                            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.light' }}>
                                {user?.name ? user.name[0].toUpperCase() : <Person />}
                            </Avatar>
                        </Box>

                        <Menu
                            anchorEl={anchorEl}
                            open={openMenu}
                            onClose={handleProfileClose}
                            PaperProps={{
                                elevation: 0,
                                sx: {
                                    overflow: 'visible',
                                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                                    mt: 1.5,
                                    borderRadius: 2,
                                    minWidth: 180,
                                    '&:before': {
                                        content: '""',
                                        display: 'block',
                                        position: 'absolute',
                                        top: 0,
                                        right: 14,
                                        width: 10,
                                        height: 10,
                                        bgcolor: 'background.paper',
                                        transform: 'translateY(-50%) rotate(45deg)',
                                        zIndex: 0,
                                    },
                                },
                            }}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', mb: 1 }}>
                                <Typography variant="subtitle2" fontWeight={700}>Signed in as</Typography>
                                <Typography variant="body2" color="text.secondary" noWrap>{user?.email}</Typography>
                            </Box>
                            <MenuItem onClick={handleProfileClose} sx={{ borderRadius: 1, mx: 1 }}>
                                <ListItemIcon><Person fontSize="small" /></ListItemIcon> Profile
                            </MenuItem>
                            <MenuItem onClick={handleProfileClose} sx={{ borderRadius: 1, mx: 1 }}>
                                <ListItemIcon><Settings fontSize="small" /></ListItemIcon> Settings
                            </MenuItem>
                            <Divider sx={{ my: 1 }} />
                            <MenuItem onClick={handleLogout} sx={{ borderRadius: 1, mx: 1, color: 'error.main' }}>
                                <ListItemIcon><Logout fontSize="small" color="error" /></ListItemIcon> Logout
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <Box
                component="nav"
                sx={{
                    width: { md: sidebarOpen ? drawerWidth : miniDrawerWidth },
                    flexShrink: { md: 0 },
                    transition: theme.transitions.create('width', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                }}
            >
                {/* Mobile Drawer (Temporary) */}
                <Drawer
                    variant="temporary"
                    open={sidebarOpen && !isDesktop}
                    onClose={handleSidebarToggle}
                    ModalProps={{
                        keepMounted: true,
                        BackdropProps: {
                            sx: { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
                        }
                    }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawerContent}
                </Drawer>

                {/* Desktop Drawer (Permanent with dynamic width) */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: sidebarOpen ? drawerWidth : miniDrawerWidth,
                            transition: theme.transitions.create('width', {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.enteringScreen,
                            }),
                            overflowX: 'hidden', // Hide overflow content when collapsed
                            borderRight: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                        },
                    }}
                    open
                >
                    {drawerContent}
                </Drawer>
            </Box>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { md: `calc(100% - ${sidebarOpen ? drawerWidth : miniDrawerWidth}px)` },
                    height: '100vh',
                    overflow: 'auto',
                    transition: theme.transitions.create('margin', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                    pt: '80px', // AppBar height + spacing
                    background: mode === 'dark'
                        ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)'
                        : 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
                }}
            >
                <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default Layout;
