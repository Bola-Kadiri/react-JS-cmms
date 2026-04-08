import React, { useEffect, useRef } from 'react';
import { 
  Users, 
  ClipboardCheck, 
  Wrench, 
  GitBranch, 
  Phone, 
  FileText, 
  Package, 
  BarChart3,
  LogIn,
  Info
} from 'lucide-react';
import { Line } from 'recharts';

interface IconCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  rotation: number;
  distance: number;
}

const IconCard: React.FC<IconCardProps> = ({ icon, title, description, rotation, distance }) => {
  const cardStyle = {
    transform: `rotate(${rotation}deg) translate(${distance}px) rotate(-${rotation}deg)`
  };

  return (
    <div 
      className="absolute w-28 h-28 md:w-32 md:h-32 bg-gray-100 border border-green-400 rounded-full flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:-translate-y-2 p-3 group"
      style={{
        ...cardStyle,
        backgroundColor: '#f0efef',
        border: '1px solid #29f07c',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.6)'
      }}
    >
      <div className="text-2xl md:text-3xl mb-1" style={{ color: '#28a745' }}>
        {icon}
      </div>
      <span className="text-xs md:text-sm font-bold leading-tight" style={{ color: '#555' }}>
        {title}
      </span>
      
      {/* Hover description */}
      <div 
        className="absolute top-32 md:top-36 left-1/2 transform -translate-x-1/2 p-2 rounded text-xs w-36 md:w-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
        style={{
          backgroundColor: '#343a40',
          color: '#fff'
        }}
      >
        {description}
      </div>
    </div>
  );
};

const PredictiveChart: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 160;
    canvas.height = 160;

    // Sample data points
    const data = [65, 59, 80, 81, 76];
    const labels = ['1', '2', '3', '4', '5'];
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set up chart dimensions
    const padding = 20;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    
    // Find max value for scaling
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue;
    
    // Draw line
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    data.forEach((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + ((maxValue - value) / range) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Draw points
    ctx.fillStyle = '#22c55e';
    data.forEach((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + ((maxValue - value) / range) * chartHeight;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
    
  }, []);

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 md:w-48 md:h-48 rounded-full p-4 z-10"
         style={{
           background: 'rgba(255, 255, 255, 0.9)',
           boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
         }}>
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
      />
    </div>
  );
};

const AlphaCMMSLanding: React.FC = () => {
  // Add CSS animation keyframes to the document head
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes gradient {
        0%, 100% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
      }
      
      .icon-card:hover {
        box-shadow: 0 10px 12px rgba(3, 129, 9, 0.9) !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const iconCards = [
    {
      icon: <Users />,
      title: "Staff Attendance",
      description: "Track and manage staff attendance efficiently.",
      rotation: 315,
      distance: 240
    },
    {
      icon: <ClipboardCheck />,
      title: "Facility Inspection", 
      description: "Conduct thorough facility inspections with ease.",
      rotation: 45,
      distance: 240
    },
    {
      icon: <Wrench />,
      title: "CMMS PPM",
      description: "Manage planned preventive maintenance effectively.",
      rotation: 0,
      distance: 240
    },
    {
      icon: <GitBranch />,
      title: "Request Flow",
      description: "Streamline request and workflow processes.",
      rotation: 90,
      distance: 240
    },
    {
      icon: <Phone />,
      title: "Call-2-Fix",
      description: "Quickly resolve issues with our call-to-fix system.",
      rotation: 180,
      distance: 240
    },
    {
      icon: <FileText />,
      title: "Contract & Procurement",
      description: "Manage contracts and procurement seamlessly.",
      rotation: 225,
      distance: 240
    },
    {
      icon: <Package />,
      title: "Materials Management",
      description: "Efficiently manage materials and inventory.",
      rotation: 135,
      distance: 240
    },
    {
      icon: <BarChart3 />,
      title: "Predictive Dashboard",
      description: "Gain insights with our predictive analytics dashboard.",
      rotation: 270,
      distance: 240
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-200 via-green-300 to-green-400 bg-[length:400%_400%] animate-[gradient_10s_ease_infinite]"
         style={{
           background: 'linear-gradient(115deg, #dbf7b7 0%, #c3cfe2 100%)',
           backgroundSize: '400% 400%',
           animation: 'gradient 10s ease infinite'
         }}>
      {/* Navigation */}
      <nav className="text-white p-2" style={{ backgroundColor: '#28a745' }}>
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold">ALPHA CMMS</h1>
          <button className="flex items-center space-x-2 hover:text-gray-200 transition-colors">
            <LogIn className="w-5 h-5" />
            <span>Login</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 pb-20">
        {/* Hero Section */}
        <div className="p-8 max-w-6xl w-full"
             style={{ 
            //    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
             }}>
          {/* Circular Icon Layout */}
          <div className="relative w-96 h-96 md:w-[600px] md:h-[600px] mx-auto rounded-full bg-cover bg-center flex items-center justify-center"
               style={{ 
                 backgroundImage: "url('/assets/ASSE.png')",
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 boxShadow: '0 4px 15px rgba(0, 0, 0, 0.8)'
               }}>
            
            {/* Central Predictive Chart */}
            <PredictiveChart />
            
            {/* Icon Cards */}
            {iconCards.map((card, index) => (
              <IconCard
                key={index}
                icon={card.icon}
                title={card.title}
                description={card.description}
                rotation={card.rotation}
                distance={card.distance}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-white p-2 mt-auto" style={{ backgroundColor: '#28a745' }}>
        <div className="container mx-auto flex justify-between items-center">
          <h2 className="text-lg font-bold">Alpha CMMS</h2>
          <button className="flex items-center space-x-2 hover:text-gray-200 transition-colors">
            <Info className="w-5 h-5" />
            <span>About</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default AlphaCMMSLanding;