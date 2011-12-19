            public class Convexhull
            {
			
                // given a polygon formed by pts, return the subset of those points  
                // that form the convex hull of the polygon  
                // for integer Point structs, not float/PointF  
                public static Point[] ConvexHull(Point[] pts)
                {
                    PointF[] mpts = FromPoints(pts);
                    PointF[] result = ConvexHull(mpts);
                    int n = result.Length;
                    Point[] ret = new Point[n];
                    for (int i = 0; i < n; i++)
                        ret[i] = new Point((int)result[i].X, (int)result[i].Y);
                    return ret;
                }

                // given a polygon formed by pts, return the subset of those points  
                // that form the convex hull of the polygon  
                public static PointF[] ConvexHull(PointF[] pts)
                {
                    PointF[][] l_u = ConvexHull_LU(pts);
                    PointF[] lower = l_u[0];
                    PointF[] upper = l_u[1];
                    // Join the lower and upper hull  
                    int nl = lower.Length;
                    int nu = upper.Length;
                    PointF[] result = new PointF[nl + nu];
                    for (int i = 0; i < nl; i++)
                        result[i] = lower[i];
                    for (int i = 0; i < nu; i++)
                        result[i + nl] = upper[i];
                    return result;
                }

                // returns the two points that form the diameter of the polygon formed by points pts  
                // takes and returns integer Point structs, not PointF  
                public static Point[] Diameter(Point[] pts)
                {
                    PointF[] fpts = FromPoints(pts);
                    PointF[] maxPair = Diameter(fpts);
                    return new Point[] { new Point((int)maxPair[0].X, (int)maxPair[0].Y), new Point((int)maxPair[1].X, (int)maxPair[1].Y) };
                }

                // returns the two points that form the diameter of the polygon formed by points pts  
                public static PointF[] Diameter(PointF[] pts)
                {
                    IEnumerable<Pair> pairs = RotatingCalipers(pts);
                    double max2 = Double.NegativeInfinity;
                    Pair maxPair = null;
                    foreach (Pair pair in pairs)
                    {
                        PointF p = pair.a;
                        PointF q = pair.b;
                        double dx = p.X - q.X;
                        double dy = p.Y - q.Y;
                        double dist2 = dx * dx + dy * dy;
                        if (dist2 > max2)
                        {
                            maxPair = pair;
                            max2 = dist2;
                        }
                    }

                    // return Math.Sqrt(max2);  
                    return new PointF[] { maxPair.a, maxPair.b };
                }

                private static PointF[] FromPoints(Point[] pts)
                {
                    int n = pts.Length;
                    PointF[] mpts = new PointF[n];
                    for (int i = 0; i < n; i++)
                        mpts[i] = new PointF(pts[i].X, pts[i].Y);
                    return mpts;
                }

                private static double Orientation(PointF p, PointF q, PointF r)
                {
                    return (q.Y - p.Y) * (r.X - p.X) - (q.X - p.X) * (r.Y - p.Y);
                }

                private static void Pop<T>(List<T> l)
                {
                    int n = l.Count;
                    l.RemoveAt(n - 1);
                }

                private static T At<T>(List<T> l, int index)
                {
                    int n = l.Count;
                    if (index < 0)
                        return l[n + index];
                    return l[index];
                }

                private static PointF[][] ConvexHull_LU(PointF[] arr_pts)
                {
                    List<PointF> u = new List<PointF>();
                    List<PointF> l = new List<PointF>();
                    List<PointF> pts = new List<PointF>(arr_pts.Length);
                    pts.AddRange(arr_pts);
                    pts.Sort(Compare);
                    foreach (PointF p in pts)
                    {
                        while (u.Count > 1 && Orientation(At(u, -2), At(u, -1), p) <= 0) Pop(u);
                        while (l.Count > 1 && Orientation(At(l, -2), At(l, -1), p) >= 0) Pop(l);
                        u.Add(p);
                        l.Add(p);
                    }
                    return new PointF[][] { l.ToArray(), u.ToArray() };
                }

                private class Pair
                {
                    public PointF a, b;
                    public Pair(PointF a, PointF b)
                    {
                        this.a = a;
                        this.b = b;
                    }
                }

                private static IEnumerable<Pair> RotatingCalipers(PointF[] pts)
                {
                    PointF[][] l_u = ConvexHull_LU(pts);
                    PointF[] lower = l_u[0];
                    PointF[] upper = l_u[1];
                    int i = 0;
                    int j = lower.Length - 1;
                    while (i < upper.Length - 1 || j > 0)
                    {
                        yield return new Pair(upper[i], lower[j]);
                        if (i == upper.Length - 1) j--;
                        else if (j == 0) i += 1;
                        else if ((upper[i + 1].Y - upper[i].Y) * (lower[j].X - lower[j - 1].X) >
                            (lower[j].Y - lower[j - 1].Y) * (upper[i + 1].X - upper[i].X))
                            i++;
                        else
                            j--;
                    }
                }

                private static int Compare(PointF a, PointF b)
                {
                    if (a.X < b.X)
                    {
                        return -1;
                    }
                    else if (a.X == b.X)
                    {
                        if (a.Y < b.Y)
                            return -1;
                        else if (a.Y == b.Y)
                            return 0;
                    }
                    return 1;
                }
            }
