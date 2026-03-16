/**
 * Layout Architecture Visual Diagram
 * ===================================
 * 
 * This component provides a visual representation of the global
 * application layout architecture for documentation purposes.
 * 
 * It shows:
 * - Sidebar Navigation (z-50)
 * - Top Header (z-40)
 * - Main Content Canvas (z-0)
 * - Layer hierarchy
 * - Component boundaries
 */

export default function LayoutDiagram() {
  return (
    <div className="p-8 bg-[#030A10] text-white font-mono text-xs">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-lg font-bold mb-4 text-[#14a2e3]">
          Global Application Layout Architecture
        </h2>
        
        {/* Main layout visualization */}
        <div className="border-2 border-[#121e27] rounded-lg p-4 mb-6">
          <div className="flex gap-0">
            {/* Sidebar */}
            <div className="w-16 bg-[#0a1520] border border-[#14a2e3] rounded-l p-2 flex flex-col items-center gap-2">
              <div className="text-[8px] text-center text-[#14a2e3] font-bold mb-2">
                SIDEBAR
                <br />
                z-[50]
                <br />
                64px
              </div>
              <div className="w-6 h-6 bg-[#14a2e3] bg-opacity-20 rounded" />
              <div className="w-6 h-6 bg-white bg-opacity-10 rounded" />
              <div className="w-6 h-6 bg-white bg-opacity-10 rounded" />
              <div className="w-6 h-6 bg-white bg-opacity-10 rounded" />
              <div className="flex-1" />
              <div className="w-6 h-6 bg-white bg-opacity-10 rounded" />
            </div>

            {/* Main area */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="bg-[#0a1520] border border-[#57b1ff] border-opacity-30 p-3 flex items-center justify-between">
                <div className="text-[10px] text-[#57b1ff] font-bold">
                  HEADER (z-[40]) - 72px height
                </div>
                <div className="text-[8px] text-[#89949e]">
                  Page Title | UTC | Actions
                </div>
              </div>

              {/* Content canvas */}
              <div className="flex-1 bg-[#030A10] border border-[#62707d] border-opacity-30 p-4 min-h-[300px]">
                <div className="text-[10px] text-[#62707d] mb-3 font-bold">
                  MAIN CONTENT CANVAS (z-[0])
                </div>
                <div className="space-y-2">
                  <div className="bg-white bg-opacity-5 p-2 rounded text-[8px] text-[#dadfe3]">
                    • Watch Center Dashboard
                  </div>
                  <div className="bg-white bg-opacity-5 p-2 rounded text-[8px] text-[#dadfe3]">
                    • Attack Path Visualization
                  </div>
                  <div className="bg-white bg-opacity-5 p-2 rounded text-[8px] text-[#dadfe3]">
                    • Asset Register Tables
                  </div>
                  <div className="bg-white bg-opacity-5 p-2 rounded text-[8px] text-[#dadfe3]">
                    • Risk Management Views
                  </div>
                  <div className="bg-white bg-opacity-5 p-2 rounded text-[8px] text-[#dadfe3]">
                    • Compliance Dashboards
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Z-index hierarchy */}
        <div className="bg-[#0a1520] border border-[#121e27] rounded-lg p-4 mb-6">
          <h3 className="text-sm font-bold mb-3 text-[#14a2e3]">Z-Index Layering</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="w-12 text-right text-[#14a2e3] font-bold">z-[50]</div>
              <div className="flex-1 bg-[#14a2e3] bg-opacity-20 border border-[#14a2e3] p-2 rounded">
                Sidebar Navigation (Highest Layer)
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 text-right text-[#57b1ff] font-bold">z-[40]</div>
              <div className="flex-1 bg-[#57b1ff] bg-opacity-20 border border-[#57b1ff] p-2 rounded">
                Top Header (Second Layer)
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 text-right text-[#62707d] font-bold">z-[0]</div>
              <div className="flex-1 bg-[#62707d] bg-opacity-20 border border-[#62707d] p-2 rounded">
                Main Content Canvas (Base Layer)
              </div>
            </div>
          </div>
        </div>

        {/* Key features */}
        <div className="bg-[#0a1520] border border-[#121e27] rounded-lg p-4">
          <h3 className="text-sm font-bold mb-3 text-[#14a2e3]">Key Features</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] text-[#14a2e3] font-bold mb-2">Sidebar Navigation</div>
              <ul className="text-[9px] text-[#89949e] space-y-1">
                <li>✓ 64px fixed width</li>
                <li>✓ Persists across all routes</li>
                <li>✓ Tooltips always visible (z-50)</li>
                <li>✓ 4 icon states (default, hover, active, active+hover)</li>
              </ul>
            </div>
            <div>
              <div className="text-[10px] text-[#14a2e3] font-bold mb-2">Top Header</div>
              <ul className="text-[9px] text-[#89949e] space-y-1">
                <li>✓ 72px fixed height</li>
                <li>✓ Dynamic page title</li>
                <li>✓ Sticky positioning</li>
                <li>✓ Global actions (AI, Activity, Profile)</li>
              </ul>
            </div>
            <div>
              <div className="text-[10px] text-[#14a2e3] font-bold mb-2">Content Canvas</div>
              <ul className="text-[9px] text-[#89949e] space-y-1">
                <li>✓ Scrollable overflow</li>
                <li>✓ Never overlaps sidebar</li>
                <li>✓ React Router Outlet</li>
                <li>✓ All pages render here</li>
              </ul>
            </div>
            <div>
              <div className="text-[10px] text-[#14a2e3] font-bold mb-2">Overflow Rules</div>
              <ul className="text-[9px] text-[#89949e] space-y-1">
                <li>✓ Sidebar tooltips never clipped</li>
                <li>✓ Content scrolls vertically</li>
                <li>✓ Proper z-index hierarchy</li>
                <li>✓ No layout shift on navigation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <div className="mt-6 bg-[#0a1520] border border-[#121e27] rounded-lg p-4">
          <h3 className="text-sm font-bold mb-3 text-[#14a2e3]">Available Modules (15)</h3>
          <div className="grid grid-cols-3 gap-2 text-[9px] text-[#89949e]">
            <div>✓ Watch Center</div>
            <div>✓ Control Center</div>
            <div>✓ Asset Register</div>
            <div>✓ Employees</div>
            <div>✓ Risk Register</div>
            <div>✓ Attack Paths</div>
            <div>✓ Vulnerabilities</div>
            <div>✓ Misconfigurations</div>
            <div>✓ Case Management</div>
            <div>✓ Compliance</div>
            <div>✓ Integrations</div>
            <div>✓ Workflows</div>
            <div>✓ Module Config</div>
            <div>✓ Settings</div>
            <div>✓ Profile</div>
          </div>
        </div>
      </div>
    </div>
  );
}