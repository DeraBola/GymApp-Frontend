'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

interface AppModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  /** Max width of dialog */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg';
}

export function AppModal({ open, onClose, title, subtitle, children, maxWidth = 'sm' }: AppModalProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={maxWidth}>
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          pb: 0.5,
          pt: 3,
          px: 3,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem' }} color="text.primary">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ mt: -0.5, color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>{children}</DialogContent>
    </Dialog>
  );
}

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmColor?: 'error' | 'primary' | 'warning';
  isLoading?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmColor = 'error',
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ textAlign: 'center', pt: 4, pb: 2, px: 3 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
            bgcolor: confirmColor === 'error' ? '#fef2f2' : confirmColor === 'warning' ? '#fffbeb' : '#fdf4ff',
          }}
        >
          <WarningAmberRoundedIcon
            sx={{
              color: confirmColor === 'error' ? '#ef4444' : confirmColor === 'warning' ? '#f59e0b' : '#a855f7',
              fontSize: 28,
            }}
          />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }} color="text.primary">
          {title}
        </Typography>
        <DialogContentText sx={{ fontSize: '0.875rem' }}>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" fullWidth sx={{ borderColor: '#e2e8f0', color: 'text.secondary', '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' } }}>
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" color={confirmColor} fullWidth disabled={isLoading}>
          {isLoading ? 'Processing...' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
