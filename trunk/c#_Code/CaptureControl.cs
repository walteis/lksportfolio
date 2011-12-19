        public Bitmap CaptureControl(Control control)
        {
            Bitmap controlBmp;
            using (Graphics g1 = control.CreateGraphics())
            {
                controlBmp = new Bitmap(control.Width, control.Height, g1);
                using (Graphics g2 = Graphics.FromImage(controlBmp))
                {
                    IntPtr dc1 = g1.GetHdc();
                    IntPtr dc2 = g2.GetHdc();
                    Common.LegacyWin.BitBlt(dc2, 0, 0, control.Width, control.Height, dc1, 0, 0, 13369376);
                    g1.ReleaseHdc(dc1);
                    g2.ReleaseHdc(dc2);
                }
            }

            return controlBmp;
        }
