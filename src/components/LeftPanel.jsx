import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from 'react-router-dom';

function LeftPanel() {
  return (
    <div className="fixed top-0 left-0 h-full w-1/5 bg-white text-black shadow-lg flex flex-col py-8 px-5 space-y-4">
      
      <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
        <img src='src/assets/pharmize.png' alt="Pharmize" className="w-full h-full object-cover" />
      </div>

      <div className="text-center">
        <div className="text-xl font-bold mb-1">Pharmize</div>
        <div className="text-lg font-semibold text-gray-600">Admin Panel</div>
      </div>

      <nav className="mt-6 space-y-8">
        <Link to="/dashboard" className="block text-left hover:text-blue-600 font-medium">Dashboard</Link>
        <Link to="/activity" className="block text-left hover:text-blue-600 font-medium">Activity Logs</Link>
      </nav>

      <div className="mt-2 text-left space-y-2">
        <Accordion type="single" collapsible>
          <AccordionItem value="medicine">
            <AccordionTrigger className="text-md">Medicine</AccordionTrigger>
            <AccordionContent>
              <div className="pl-4 flex flex-col gap-1">
                <Link to="/medicine/add" className="hover:text-blue-600">Add Medicine</Link>
                <Link to="/medicine/inventory" className="hover:text-blue-600">View Inventory</Link>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="invoice">
            <AccordionTrigger className="text-md">Invoice</AccordionTrigger>
            <AccordionContent>
              <div className="pl-4 flex flex-col gap-1">
                <Link to="/invoice/view" className="hover:text-blue-600">View Invoice</Link>
                <Link to="/invoice/create" className="hover:text-blue-600">Create Invoice</Link>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="report">
            <AccordionTrigger className="text-md">Report</AccordionTrigger>
            <AccordionContent>
              <div className="pl-4 flex flex-col gap-1">
                <Link to="/report/sales" className="hover:text-blue-600">Sales Report</Link>
                <Link to="/report/purchase" className="hover:text-blue-600">Purchase Report</Link>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="customer">
            <AccordionTrigger className="text-md">Customer</AccordionTrigger>
            <AccordionContent>
              <div className="pl-4 flex flex-col gap-1">
                <Link to="/customer/add" className="hover:text-blue-600">Add Customer</Link>
                <Link to="/customer/view" className="hover:text-blue-600">View Customer</Link>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="supplier">
            <AccordionTrigger className="text-md">Supplier</AccordionTrigger>
            <AccordionContent>
              <div className="pl-4 flex flex-col gap-1">
                <Link to="/supplier/add" className="hover:text-blue-600">Add Supplier</Link>
                <Link to="/supplier/view" className="hover:text-blue-600">View Supplier</Link>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

export default LeftPanel;
