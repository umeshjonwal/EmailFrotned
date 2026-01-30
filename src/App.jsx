import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  IconButton,
  Tooltip,
  Paper,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import UpgradeIcon from '@mui/icons-material/WorkspacePremium';
import MicIcon from '@mui/icons-material/Mic';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const drawerWidth = 260;

function App() {
  const [emailContent, setEmailContent] = useState('');
  const [tone, setTone] = useState('');
  const [generateReply, setGenerateReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleGenerateReply = async () => {
    if (!emailContent.trim()) {
      setError('Please enter the original email.');
      return;
    }

    setLoading(true);
    setError('');
    setGenerateReply('');

    try {
      const res = await axios.post(`${API_URL}/api/email/generate`, {
        emailContent,
        tone,
      });
      setGenerateReply(res.data);
    } catch (err) {
      setError(err?.response?.data || 'Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) return;
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.start();
    recognition.onresult = (e) =>
      setEmailContent((p) => p + ' ' + e.results[0][0].transcript);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateReply);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const speakReply = () => {
    const utter = new SpeechSynthesisUtterance(generateReply);
    utter.lang = 'en-US';
    window.speechSynthesis.speak(utter);
  };

  /* ================= SIDEBAR ================= */
  const drawer = (
    <Box sx={{ height: '100%', bgcolor: '#0f172a', color: '#fff' }}>
      <Toolbar>
        <Typography fontWeight={700}>📧 MailGen Pro</Typography>
      </Toolbar>
      <Divider sx={{ bgcolor: '#1e293b' }} />
      <List>
        <ListItem
          button
          onClick={() => {
            setEmailContent('');
            setGenerateReply('');
            setError('');
            if (isMobile) setMobileOpen(false);
          }}
        >
          <ListItemIcon sx={{ color: '#38bdf8' }}>
            <AddIcon />
          </ListItemIcon>
          <ListItemText primary="New Email" />
        </ListItem>

        <ListItem button>
          <ListItemIcon sx={{ color: '#facc15' }}>
            <UpgradeIcon />
          </ListItemIcon>
          <ListItemText primary="Upgrade Plan" />
        </ListItem>
      </List>
    </Box>
  );

  /* ================= UI ================= */
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f1f5f9' }}>
      {isMobile && (
        <AppBar position="fixed">
          <Toolbar>
            <IconButton color="inherit" onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </IconButton>
            <Typography fontWeight={600}>MailGen</Typography>
          </Toolbar>
        </AppBar>
      )}

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            borderRight: 'none',
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: isMobile ? 3 : 5,
          mt: isMobile ? 8 : 0,
          maxWidth: 1000,
          mx: 'auto',
        }}
      >
        <Paper elevation={5} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h4" fontWeight={700} mb={3}>
            🤖 AI Email Reply Generator
          </Typography>

          <Button
            variant="outlined"
            fullWidth
            startIcon={<MicIcon />}
            onClick={handleVoiceInput}
            sx={{ mb: 2, py: 1.4 }}
          >
            Speak Email
          </Button>

          <TextField
            fullWidth
            multiline
            rows={5}
            label="Original Email"
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Tone</InputLabel>
            <Select
              value={tone}
              label="Tone"
              onChange={(e) => setTone(e.target.value)}
            >
              <MenuItem value="">Default</MenuItem>
              <MenuItem value="Professional">Professional</MenuItem>
              <MenuItem value="Casual">Casual</MenuItem>
              <MenuItem value="Friendly">Friendly</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleGenerateReply}
            disabled={loading}
            sx={{ py: 1.6 }}
          >
            {loading ? 'Generating…' : 'Generate Reply'}
          </Button>

          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}

          {generateReply && (
            <Box mt={4} position="relative">
              <TextField
                fullWidth
                multiline
                rows={6}
                label="AI Generated Reply"
                value={generateReply}
                InputProps={{ readOnly: true }}
              />

              <Tooltip title={copied ? 'Copied!' : 'Copy'}>
                <IconButton
                  onClick={handleCopy}
                  sx={{ position: 'absolute', top: 10, right: 52 }}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Read Aloud">
                <IconButton
                  onClick={speakReply}
                  sx={{ position: 'absolute', top: 10, right: 10 }}
                >
                  <VolumeUpIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}

          {/* ===== FOOTER ===== */}
          <Box
            mt={4}
            pt={2}
            textAlign="center"
            borderTop="1px solid #e5e7eb"
          >
            <Typography variant="body2" color="text.secondary">
              Created by{' '}
              <a
                href="https://www.linkedin.com/in/javawithumesh"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  textDecoration: 'none',
                  fontWeight: 600,
                  color: '#2563eb',
                }}
              >
                Umesh Jonwal
              </a>
            </Typography>
          </Box>
          {/* ================== */}
        </Paper>
      </Box>
    </Box>
  );
}

export default App;
