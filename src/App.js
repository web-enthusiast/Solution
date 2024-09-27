import React, { useState } from 'react';
import { Container, Paper, Typography, Button, CircularProgress, Grid, Card, CardContent, createTheme, ThemeProvider } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  const [files, setFiles] = useState({ proposal: null, financial: null });
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (event, type) => {
    setFiles({ ...files, [type]: event.target.files[0] });
  };

  const handleSubmit = async () => {
    setProcessing(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append('proposal_form', files.proposal);
    formData.append('financial_statement', files.financial);

    try {
      const response = await fetch('http://127.0.0.1:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'An error occurred');
      }

      const data = await response.json();
      setResult(data);
      console.log('Quotation Result:', data); 
    } catch (error) {
      console.error('Error uploading files:', error);
      setError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md">
        <Paper elevation={3} style={{ padding: '2rem', marginTop: '2rem' }}>
          <Typography variant="h4" gutterBottom>
            AI-Powered PII Quotation Generator
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUploadIcon />}
                fullWidth
              >
                Upload Proposal Form
                <input
                  type="file"
                  hidden
                  accept=".pdf,.docx,.doc"
                  onChange={(e) => handleFileChange(e, 'proposal')}
                />
              </Button>
              <Typography variant="body2" style={{ marginTop: '0.5rem' }}>
                {files.proposal ? files.proposal.name : 'No file selected'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUploadIcon />}
                fullWidth
              >
                Upload Financial Statement
                <input
                  type="file"
                  hidden
                  accept=".csv,.xlsx,.xls,.pdf"
                  onChange={(e) => handleFileChange(e, 'financial')}
                />
              </Button>
              <Typography variant="body2" style={{ marginTop: '0.5rem' }}>
                {files.financial ? files.financial.name : 'No file selected'}
              </Typography>
            </Grid>
          </Grid>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!files.proposal || !files.financial || processing}
            style={{ marginTop: '1rem' }}
            fullWidth
          >
            Generate Quotation
          </Button>
          {processing && (
            <CircularProgress style={{ display: 'block', margin: '1rem auto' }} />
          )}
          {error && (
            <Typography color="error" style={{ marginTop: '1rem' }}>
              Error: {error}
            </Typography>
          )}
          {result && (
            <Card style={{ marginTop: '1rem' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quotation Result
                </Typography>
                <Typography variant="body1">
                  Premium: ${result.premium.toFixed(2)}
                </Typography>
                <Typography variant="body1">
                  Risk Score: {(result.risk_score * 100).toFixed(2)}%
                </Typography>
                <Typography variant="body1">
                  Recommendation: {result.recommendation}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default App;