import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import ReactFlow, {
  ReactFlowProvider,
  BackgroundVariant,
  Background,
  Controls,
  MarkerType,
  applyNodeChanges,
  Handle,
  Position,
  getNodesBounds,
  getViewportForBounds,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";
import { toPng } from "html-to-image";
import {
  Key,
  Link as LinkIcon,
  Database,
  ChevronRight,
  Maximize2,
  Minimize2,
  Download,
  Search,
  Loader2,
} from "lucide-react";

/* ================== INNER ================== */

const VisualizerInner = ({ data }: { data: any }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false); // New State for Loader

  const containerRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<ReactFlowInstance | null>(null);

  /* ---------- IMAGE EXPORT LOGIC ---------- */

  const downloadImage = async () => {
    if (!flowRef.current || nodes.length === 0 || isExporting) return;

    setIsExporting(true); // Start Loader

    const nodesBounds = getNodesBounds(nodes);
    const imageWidth = 2048;
    const imageHeight = 2048;

    const viewport = getViewportForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.1,
      2,
      0.2
    );

    const viewportElement = document.querySelector(".react-flow__viewport") as HTMLElement;

    if (viewportElement) {
      const filter = (node: HTMLElement) => {
        if (node.classList?.contains('monaco-editor') || node.classList?.contains('monaco-colors')) {
          return false;
        }
        if (node.tagName === 'STYLE' && node.textContent?.includes('codicon')) {
          return false;
        }
        return true;
      };

      toPng(viewportElement, {
        backgroundColor: "#1a1a1a",
        width: imageWidth,
        height: imageHeight,
        filter: filter,
        skipFonts: true,
        style: {
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        },
      })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `database-schema-${new Date().getTime()}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error("Export failed:", err);
      })
      .finally(() => {
        setIsExporting(false); // Stop Loader
      });
    } else {
      setIsExporting(false);
    }
  };

  /* ---------- SEARCH & HIGHLIGHT ---------- */

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        style: {
          ...node.style,
          opacity: query === "" || node.id.toLowerCase().includes(query) ? 1 : 0.2,
          transition: "opacity 0.2s ease-in-out",
        },
      }))
    );
  };

  /* ---------- FULLSCREEN ---------- */

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(() => {
        flowRef.current?.fitView({ padding: 0.25, duration: 300 });
      }, 300);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  /* ---------- FLOW HANDLERS ---------- */

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => eds),
    []
  );

  /* ---------- DATA → GRAPH ---------- */

  useEffect(() => {
    const schema = data?.schema || [];
    const constraints = data?.constraints || [];
    if (!schema.length) return;

    const grouped: Record<string, any[]> = {};
    schema.forEach((c: any) => {
      grouped[c.table_name] ??= [];
      grouped[c.table_name].push(c);
    });

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    Object.keys(grouped).forEach((table, i) => {
      newNodes.push({
        id: table,
        position: { x: (i % 2) * 520, y: Math.floor(i / 2) * 380 },
        dragHandle: ".drag-handle",
        data: {
          label: (
            <div className="text-[11px] min-w-[260px] bg-[#333] text-[#E0E0E0] rounded border border-[#1a1a1a] shadow-xl overflow-hidden">
              <div className="drag-handle bg-[#212121] px-3 py-2 font-bold flex justify-between items-center border-b border-[#111] cursor-grab active:cursor-grabbing">
                <div className="flex gap-2 items-center">
                  <Database size={11} className="text-[#888]" />
                  <span className="tracking-wide uppercase text-[10px]">{table}</span>
                </div>
                <ChevronRight size={12} className="text-[#777]" />
              </div>

              <div className="relative">
                <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
                <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />

                {grouped[table].map((c: any) => {
                  const cons = constraints.find(
                    (k: any) =>
                      k.table_name === table &&
                      k.column_name === c.column_name
                  );

                  return (
                    <div
                      key={c.column_name}
                      className="flex justify-between px-3 py-1.5 border-b border-[#2a2a2a] hover:bg-[#3d3d3d] transition-colors"
                    >
                      <div className="flex gap-2 items-center">
                        {cons?.constraint_type === "PRIMARY KEY" && (
                          <Key size={10} className="text-yellow-400" />
                        )}
                        {cons?.constraint_type === "FOREIGN KEY" && (
                          <LinkIcon size={10} className="text-blue-400" />
                        )}
                        <span className={cons?.constraint_type === "PRIMARY KEY" ? "text-white font-bold" : ""}>
                          {c.column_name}
                        </span>
                      </div>

                      <span className="text-[#888] text-[9px] font-mono opacity-80 uppercase">
                        {c.data_type.split(" ")[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ),
        },
      });
    });

    constraints.forEach((c: any) => {
      if (c.constraint_type === "FOREIGN KEY" && c.referenced_table_name) {
        newEdges.push({
          id: `fk-${c.table_name}-${c.column_name}`,
          source: c.table_name,
          target: c.referenced_table_name,
          type: "smoothstep",
          animated: false,
          style: { stroke: "#555", strokeWidth: 1.5 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#555",
          },
        });
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);

    setTimeout(() => {
      flowRef.current?.fitView({ padding: 0.25 });
    }, 150);
  }, [data]);

  return (
    <div ref={containerRef} className="h-full w-full bg-[#1a1a1a] relative overflow-hidden">
      {/* Loading Overlay */}
      {isExporting && (
        <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center transition-all p-4">
          <div className="bg-[#212121] border border-[#444] p-4 md:p-6 rounded-xl shadow-2xl flex flex-col items-center gap-3 md:gap-4 max-w-xs">
            <Loader2 size={28} className="md:w-8 md:h-8 text-blue-500 animate-spin" />
            <div className="text-center">
              <p className="text-white font-bold text-xs md:text-sm">Generating Image</p>
              <p className="text-[#888] text-[10px] md:text-xs">Processing 2048x2048 high-res export...</p>
            </div>
          </div>
        </div>
      )}

      {/* UI Overlay */}
      <div className="absolute top-2 md:top-4 left-2 md:left-4 z-50 flex gap-1 md:gap-2 items-center flex-wrap">
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-2 md:left-3 text-[#777] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            className="bg-[#212121] border border-[#444] text-white text-xs px-2 md:px-3 pl-7 md:pl-9 py-1.5 md:py-2 rounded-md focus:outline-none focus:border-blue-500 w-28 md:w-48 transition-all"
          />
        </div>
      </div>

      <div className="absolute top-2 md:top-4 right-2 md:right-4 z-50 flex gap-1 md:gap-2">
        <button
          onClick={downloadImage}
          disabled={isExporting}
          className="bg-[#212121] border border-[#444] text-white p-1.5 md:p-2 rounded hover:bg-[#333] flex items-center gap-1 md:gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm"
          title="Save High-Res Image"
        >
          {isExporting ? <Loader2 size={14} className="md:w-4 md:h-4 animate-spin" /> : <Download size={14} className="md:w-4 md:h-4" />}
          <span className="hidden md:inline">Export</span>
        </button>
        <button
          onClick={toggleFullscreen}
          className="bg-[#212121] border border-[#444] text-white p-1.5 md:p-2 rounded hover:bg-[#333] transition"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 size={14} className="md:w-4 md:h-4" /> : <Maximize2 size={14} className="md:w-4 md:h-4" />}
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        minZoom={0.05}
        maxZoom={2}
        onInit={(instance) => {
          flowRef.current = instance;
          instance.fitView({ padding: 0.25 });
        }}
      >
        <Background color="#333" gap={24} variant={BackgroundVariant.Dots} />
        <Controls
          position="bottom-right"
          style={{
            background: "#212121",
            border: "1px solid #444",
            boxShadow: "none",
          }}
        />
      </ReactFlow>
    </div>
  );
};

/* ================== EXPORT ================== */

export const SchemaVisualizer = ({ data }: { data: any }) => (
  <ReactFlowProvider>
    <VisualizerInner data={data} />
  </ReactFlowProvider>
);