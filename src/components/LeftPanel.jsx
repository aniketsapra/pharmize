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
    <div className="fixed top-0 left-0 h-full w-1/5 bg-white text-black shadow-lg flex flex-col py-6 px-4">
      <h3 className="font-bold mb-6 text-left">PharmaTrack</h3>

      <div className="w-24 h-24 bg-gray-200 rounded-full mb-6 flex items-center justify-center self-center overflow-hidden">
        <img src='src/assets/pharmize.png' alt="Pharmize" className="w-full h-full object-cover" />
      </div>

      <div className="text-lg font-semibold mb-8 text-left">Admin</div>
      <h3 className="mb-2 text-left">
        <Link to="/dashboard" className="hover:text-blue-600">
          Dashboard
        </Link>
      </h3>

      <h3 className="my-2 text-left">
        <Link to="/activity" className="hover:text-blue-600">
          Activity Logs
        </Link>
      </h3>

      <div className="w-full text-left space-y-2">
        <Accordion type="single" collapsible>
          <AccordionItem value="medicine">
            <AccordionTrigger>Medicine</AccordionTrigger>
            <AccordionContent>
              <div className="pl-2 flex flex-col gap-1">
                <Link to="/medicine/add" className="hover:text-blue-600">Add Medicine</Link>
                <Link to="/medicine/inventory" className="hover:text-blue-600">View Inventory</Link>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="invoice">
            <AccordionTrigger>Invoice</AccordionTrigger>
            <AccordionContent>
              <div className="pl-2 flex flex-col gap-1">
                <Link to="/invoice/view" className="hover:text-blue-600">View Invoice</Link>
                <Link to="/invoice/create" className="hover:text-blue-600">Create Invoice</Link>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="report">
            <AccordionTrigger>Report</AccordionTrigger>
            <AccordionContent>
              <div className="pl-2 flex flex-col gap-1">
                <Link to="/report/sales" className="hover:text-blue-600">Sales Report</Link>
                <Link to="/report/purchase" className="hover:text-blue-600">Purchase Report</Link>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="customer">
            <AccordionTrigger>Customer</AccordionTrigger>
            <AccordionContent>
              <div className="pl-2 flex flex-col gap-1">
                <Link to="/customer/add" className="hover:text-blue-600">Add Customer</Link>
                <Link to="/customer/view" className="hover:text-blue-600">View Customer</Link>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="supplier">
            <AccordionTrigger>Supplier</AccordionTrigger>
            <AccordionContent>
              <div className="pl-2 flex flex-col gap-1">
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
