using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Text;

using ESRI.ArcGISExplorer;
using ESRI.ArcGISExplorer.Application;
using ESRI.ArcGISExplorer.Mapping;
using ESRI.ArcGISExplorer.Geometry;
using ESRI.ArcGISExplorer.Data;
using ESRI.ArcGISExplorer.Threading;
using MapShots.COM.FODM;
using MapShots.COM.UOM;

namespace ArcGISExplorerAddIn2
{
    public class Button : ESRI.ArcGISExplorer.Application.Button
    {

        public IfoSummary oTempSum;
        private Polygon _pgon = null;
        private Polyline _pline = null;
        private Multipoint _mpt = new Multipoint();
        private ESRI.ArcGISExplorer.Geometry.Point pt = null;

        public override void OnClick()
        {

            MapDisplay md = Application.ActiveMapDisplay;
            


            
           // FODM objects
            IfoSummary oSum;
            FODM_RegionTypes rType;

            IfoFactory oFact = (IfoFactory)createCOMObject("FODM.foFactory");
            IfoSummaryLoader sLoad = oFact.GetSummaryLoader(oTempSum);
            oSum = (IfoSummary)sLoad.Summary;

            if (!oSum.ImportFile(@"C:\GeoData\FODM_Sample_Data\test.fsf"))
                return;


            IfoSummaryStats oStats = (IfoSummaryStats)oSum;
            IfoFCDRegion oFCD;
            IfoSensorUse grainFlowSensorUse;
            IfoSensorUse moistureSensorUse;
            MapShots.COM.UOM.ImpsUOMFactory oUOMFact = (MapShots.COM.UOM.ImpsUOMFactory)createCOMObject("mpsUOMEngine.mpsUOMFactory");


            // keys into SensorUse for mapping points
            string grainFlowKey = "";
            string moistureKey = "";


            // Begin processing summary object
            if (oSum != null && oSum.Regions.Count > 0)
            {
                // define the main column set used in the detail nodes.
                // this will be changed for each section.

                // set the min and max values used in the GetColour() call for mapping points
                #region .      Value Limits      .
                IfoStats prodInvStats = null;
                foreach (IfoRegion oRegion in oSum.Regions)
                {
                    if (prodInvStats == null)
                        prodInvStats = oRegion.ProductUses[1].RateTotals.MappableStats;
                    else
                        prodInvStats.Add(oRegion.ProductUses[1].RateTotals.MappableStats);
                }

                double prodInvMax = prodInvStats.Mean.Value + (prodInvStats.StdDev.Value * 3);
                double prodInvMin = prodInvStats.Mean.Value - (prodInvStats.StdDev.Value * 3);
                #endregion


                foreach (IfoRegion oRegion in oSum.Regions)
                {
                    oRegion.MoveFirst();

                    // setup our UOMs for use later
                    #region .      UOM setup      .
                    MapShots.COM.UOM.ImpsUOM flowUOM = oUOMFact.GetUOM(MapShots.COM.UOM.MPS_UOM_Units.MPS_Unit_lb, MapShots.COM.UOM.MPS_UOM_Units.MPS_Unit_sec);
                    MapShots.COM.UOM.ImpsUOM durUOM = oUOMFact.GetUOM2(MapShots.COM.UOM.MPS_UOM_Units.MPS_Unit_sec);
                    MapShots.COM.UOM.ImpsUOM dstUOM = oUOMFact.GetUOM2(MapShots.COM.UOM.MPS_UOM_Units.MPS_Unit_in);
                    MapShots.COM.UOM.ImpsUOM wthUOM = oUOMFact.GetUOM2(MapShots.COM.UOM.MPS_UOM_Units.MPS_Unit_in);
                    MapShots.COM.UOM.ImpsUOM mstUOM = oUOMFact.GetUOM2(MapShots.COM.UOM.MPS_UOM_Units.MPS_Unit_percent);
                    MapShots.COM.UOM.ImpsUOM areaUOM = oUOMFact.GetUOM2(MapShots.COM.UOM.MPS_UOM_Units.MPS_Unit_acre);
                    MapShots.COM.UOM.ImpsUOM yldUOM = oUOMFact.GetUOM(MapShots.COM.UOM.MPS_UOM_Units.MPS_Unit_bu, MapShots.COM.UOM.MPS_UOM_Units.MPS_Unit_acre);

                    //HACK: Use first ProductUse, an assumption that should be verified with more data
                    MapShots.COM.UOM.ImpsUOMValue lbsUOMVal = oRegion.ProductUses[1].Product.AppUOM.CloneAsUOMValue();

                    // some products will not allow cast to a CommodityUOM, so protect against exceptions
                    MapShots.COM.UOM.ImpsCommodityUOMValue oCValue = null;
                    try
                    {
                        oCValue = (MapShots.COM.UOM.ImpsCommodityUOMValue)oRegion.ProductUses[1].Product.AppUOM.CloneAsUOMValue();
                    }
                    catch { }
                    #endregion



                    // if map points requested
                    // process FCD/ICD type regions, most regions will be FCD type

                    #region .     FCD Regions     .
                    grainFlowSensorUse = String.IsNullOrEmpty(grainFlowKey) ? null : oRegion.SensorUses[grainFlowKey];
                    moistureSensorUse = String.IsNullOrEmpty(moistureKey) ? null : oRegion.SensorUses[moistureKey];


                    // cast as FCD region to get access to all
                    // that FCD goodness
                    oFCD = (IfoFCDRegion)oRegion;

                    // setup min/max values for color calculation
                    double regionMin = oCValue == null ? prodInvMin : prodInvMin / oCValue.MarketFactor;
                    double regionMax = oCValue == null ? prodInvMax : prodInvMax / oCValue.MarketFactor;

                    // this creates a false range for better colorization
                    if (regionMin == regionMax)
                    {
                        regionMin *= .5;
                        regionMax *= 2;
                    }

                    // if we don't already have a grainFlowKey, then we 
                    // need to pick a default one.  The assumption here is that
                    // there will always be at least one sensor use.
                    if (String.IsNullOrEmpty(grainFlowKey))
                        grainFlowKey = oRegion.SensorUses[1].Key;


                    double[] valueflowCopy = new double[oRegion.SensorUses[grainFlowKey].ValueArray(flowUOM, true).Length];
                    double[] valueyieldCopy = new double[oRegion.SensorUses[grainFlowKey].ValueArray(flowUOM, true).Length];
                    double[] longlatCopy = new double[oFCD.LonLatArray(0, 0).Length];
                    double[] areaCopy = new double[oFCD.AreaArray(areaUOM, true).Length];
                    double[] moistCopy = null;
                    if (!String.IsNullOrEmpty(moistureKey))
                    {
                        moistCopy = new double[oRegion.SensorUses[moistureKey].ValueArray(mstUOM, true).Length];
                        oRegion.SensorUses[moistureKey].ValueArray(mstUOM, true).CopyTo(moistCopy, 0);
                    }


                    oRegion.SensorUses[grainFlowKey].ValueArray(flowUOM, true).CopyTo(valueflowCopy, 0);
                    oRegion.SensorUses[grainFlowKey].ValueArray(yldUOM, true).CopyTo(valueyieldCopy, 0);
                    oFCD.LonLatArray(0, 0).CopyTo(longlatCopy, 0);
                    oFCD.AreaArray(areaUOM, true).CopyTo(areaCopy, 0);
                    int j = 0;

                    for (int i = 0; i < oRegion.SensorUses[grainFlowKey].ValueArray(flowUOM, true).Length; i++)
                    {
                        double value = 0.0;


                        if (grainFlowKey.Contains("Yield"))
                        {
                            oCValue.Value = valueyieldCopy[i];
                            oCValue.ActualMC = moistCopy[i];
                            value = oCValue.MarketValue;
                        }
                        else if (grainFlowKey.Contains("Flow"))
                        {
                            lbsUOMVal.Value = valueflowCopy[i] * oFCD.Duration.Value;
                            value = lbsUOMVal.Convert(MapShots.COM.UOM.MPS_UOM_Units.MPS_Unit_bu, 1 / oCValue.MarketFactor, MapShots.COM.UOM.MPS_UOM_Units.MPS_Unit_lb, MapShots.COM.UOM.MPS_UOM_Units.MPS_Unit_sec);
                            value /= areaCopy[i];
                        }
                        else
                            value = valueflowCopy[i];
                        Polyline ln = new Polyline();
                        pt = new ESRI.ArcGISExplorer.Geometry.Point();
                        pt.SetCoordinates(longlatCopy[j++], longlatCopy[j++]);
                        Symbol sym = Symbol.Marker.Square.WhiteWaypoint;
                        sym.Size = 1;

                        ln.AddPoint(pt);
                        Graphic foo = new Graphic(pt,Symbol.Marker.Sphere.Blue);
                        md.Graphics.Add(foo);
                    }
                    
                    #endregion

                    
                }
                
            }
        }


        internal static object createCOMObject(string sProgID)
        {
            // We get the type using just the ProgID
            Type oType = Type.GetTypeFromProgID(sProgID);

            if (oType != null)
            {
                return Activator.CreateInstance(oType);
            }
            return null;
        }

    }
}
