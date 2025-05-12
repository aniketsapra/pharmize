import React, { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from 'react-router-dom';

function LeftPanel() {
  const [isDark, setIsDark] = useState(false);

  const bgClass = isDark ? 'bg-gray-950 text-white' : 'bg-white text-black';
  const hoverText = isDark ? 'hover:text-blue-400' : 'hover:text-blue-600';
  const avatarBg = isDark ? 'bg-white' : 'bg-gray-200';

  return (
    <div className={`fixed top-0 left-0 h-full w-1/5 shadow-lg flex flex-col py-6 px-4 transition-colors duration-300 ${bgClass}`}>
      <h3 className="font-bold mb-6 text-left">PharmaTrack</h3>

      <div className={`w-24 h-24 ${avatarBg} rounded-full mb-6 flex items-center justify-center self-center overflow-hidden`}>
        <img src='src/assets/pharmize.png' alt="Pharmize" className="w-full h-full object-cover" />
      </div>

      <div className="text-lg font-semibold mb-8 text-left">Admin</div>
      <h3 className="mb-2 text-left">
        <Link to="/dashboard" className={hoverText}>
          Dashboard
        </Link>
      </h3>

      <h3 className="my-2 text-left">
        <Link to="/activity" className={hoverText}>
          Activity Logs
        </Link>
      </h3>

      <div className="w-full text-left space-y-2">
        <Accordion type="single" collapsible>
          <AccordionItem value="medicine">
            <AccordionTrigger>Medicine</AccordionTrigger>
            <AccordionContent>
              <div className="pl-2 flex flex-col gap-1">
                <Link to="/medicine/add" className={hoverText}>Add Medicine</Link>
                <Link to="/medicine/inventory" className={hoverText}>View Inventory</Link>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="invoice">
            <AccordionTrigger>Invoice</AccordionTrigger>
            <AccordionContent>
              <div className="pl-2 flex flex-col gap-1">
                <Link to="/invoice/view" className={hoverText}>View Invoice</Link>
                <Link to="/invoice/create" className={hoverText}>Create Invoice</Link>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="report">
            <AccordionTrigger>Report</AccordionTrigger>
            <AccordionContent>
              <div className="pl-2 flex flex-col gap-1">
                <Link to="/report/sales" className={hoverText}>Sales Report</Link>
                <Link to="/report/purchase" className={hoverText}>Purchase Report</Link>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="customer">
            <AccordionTrigger>Customer</AccordionTrigger>
            <AccordionContent>
              <div className="pl-2 flex flex-col gap-1">
                <Link to="/customer/add" className={hoverText}>Add Customer</Link>
                <Link to="/customer/view" className={hoverText}>View Customer</Link>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="supplier">
            <AccordionTrigger>Supplier</AccordionTrigger>
            <AccordionContent>
              <div className="pl-2 flex flex-col gap-1">
                <Link to="/supplier/add" className={hoverText}>Add Supplier</Link>
                <Link to="/supplier/view" className={hoverText}>View Supplier</Link>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Theme Toggle Button */}
      <button
        onClick={() => setIsDark(!isDark)}
        className={`absolute bottom-4 left-4 px-3 py-2 rounded-md shadow-md text-sm font-medium transition duration-300 ${
          isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-800'
        }`}
      >
        Toggle Theme
      </button>
    </div>
  );
}

export default LeftPanel;
