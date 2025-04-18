import React, { useContext, useEffect, useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Clock } from "lucide-react";
import { GroupContext } from "@/pages/Group";
import UserPic from "./UserPic";
import formatDate from "@/utils/formatDate";
import { fetchHistory } from "@/utils/fetchGroupData";
import { useParams } from "react-router-dom";
import Loading from "./Loading";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";

export default function PaymentHistory() {
  const { id: groupId } = useParams();
  const { group } = useContext(GroupContext);
  const [expandedItems, setExpandedItems] = useState({});
  const { history, setHistory } = useContext(GroupContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const pdfRef = useRef(null);

  // refresh history
  useEffect(() => {
    const refreshHistory = async () => {
      const newHistory = await fetchHistory(groupId);
      setHistory(newHistory);
    };
    refreshHistory();
  }, [groupId]);

  const toggleAll = () => {
    console.log("clicked toggle all");

    // toggle the deciding flag
    const newState = !isExpanded;
    setIsExpanded(newState);

    setExpandedItems(
      newState
        ? history.reduce((acc, entry) => ({ ...acc, [entry.id]: true }), {})
        : {}
    );
  };

  const toggleExpand = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">No payment history available.</p>
        </CardContent>
      </Card>
    );
  }

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Save the current expanded state to restore later
      const originalExpandedState = { ...expandedItems };

      // Expand all items
      setExpandedItems(
        history.reduce((acc, entry) => ({ ...acc, [entry.id]: true }), {})
      );

      // Wait for state update and DOM rendering
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (!pdfRef.current) {
        console.error("PDF container reference is null");
        return;
      }

      // Create PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const container = pdfRef.current;

      // Get the container dimensions
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;

      // Calculate scale to fit content on A4 page
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const scale = Math.min(pageWidth / containerWidth, 1);

      // Generate canvas from container
      const canvas = await html2canvas(container, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: true,
        allowTaint: true,
      });

      // Add canvas to PDF
      const imgData = canvas.toDataURL("image/png");

      // Calculate how many pages we need
      const totalPages = Math.ceil((containerHeight * scale) / pageHeight);

      // Add first page
      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        pageWidth,
        (containerHeight * pageWidth) / containerWidth
      );

      // Save PDF
      pdf.save(`${group.name}_payment_history.pdf`);

      // Restore original expanded state
      setExpandedItems(originalExpandedState);

      console.log("PDF export completed successfully");
    } catch (err) {
      console.error("Error exporting PDF:", err);
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Card className="mx-auto mb-20 max-w-4xl px-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-2">
            <CardTitle>Payments History</CardTitle>
            <CardDescription>{`All payments in the group ${group.name}`}</CardDescription>
          </div>

          <div className="space-x-4">
            <Button variant="outline" onClick={toggleAll}>
              Toggle All
            </Button>
            <Button variant="outline" onClick={handleExport}>
              {isExporting ? (
                <Loading action="Exporting" item="history" />
              ) : (
                "Export History"
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div ref={pdfRef} className="payment-history-container space-y-4">
            {history?.map((item) => (
              <Card key={item.id} className="payment-card overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {item.name || "Settlement"}
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatDate(item.timestamp)}
                      </CardDescription>
                    </div>

                    <div className="flex items-center">
                      <span className="mr-2 font-bold">
                        ₹{item.totalAmt?.toFixed(2) || item.amount?.toFixed(2)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="no-print h-8 w-8 p-0"
                        onClick={() => toggleExpand(item.id)}
                      >
                        {expandedItems?.[item.id] ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* payment details ( expense / split ) */}
                {expandedItems?.[item.id] && (
                  <CardContent>
                    <div className="flex items-start space-x-12">
                      {item.type == "expense" ? (
                        // type expense
                        <div className="flex-1">
                          <h4 className="mb-3 font-medium">Payers</h4>
                          <div className="space-y-3">
                            {item.payers?.map((payer, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between text-sm"
                              >
                                <div className="flex items-center gap-4">
                                  <Avatar className="h-6 w-6">
                                    <UserPic name={payer.payer.name} />
                                  </Avatar>

                                  <span>{payer.payer.name}</span>
                                </div>

                                <span
                                  className={`font-medium ${payer.paidAmt == 0 ? "" : "text-red-600"}`}
                                >
                                  ₹{payer.paidAmt.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        // type split
                        <div className="flex-1 space-y-6">
                          {/* debitor */}
                          <div>
                            <h4 className="mb-3 font-medium">Debitor</h4>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-6 w-6">
                                  <UserPic name={item.debtor.name} />
                                </Avatar>
                                <span>{item.debtor.name}</span>
                              </div>
                              <span className="font-medium text-red-600">
                                ₹{item.amount?.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* creditor */}
                          <div>
                            <h4 className="mb-3 font-medium">Creditor</h4>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-6 w-6">
                                  <UserPic name={item.creditor.name} />
                                </Avatar>
                                <span>{item.creditor.name}</span>
                              </div>
                              <span className="font-medium text-green-600">
                                ₹{item.amount?.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* balance post pay */}
                      <div className="flex-1">
                        <h4 className="mb-3 font-medium">
                          Balance After This Transaction
                        </h4>
                        <div className="space-y-3">
                          {item.balance?.map((balance, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between text-sm"
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="h-6 w-6">
                                  <UserPic name={balance.user.name} />
                                </Avatar>
                                <span>{balance.user.name}</span>
                              </div>
                              {balance.amount > 0 ? (
                                <span className="font-medium text-green-600">
                                  ₹{balance.amount.toFixed(2)}
                                </span>
                              ) : balance.amount < 0 ? (
                                <span className="font-medium text-red-600">
                                  ₹{Math.abs(balance.amount).toFixed(2)}
                                </span>
                              ) : (
                                <span className="font-medium">₹0.00</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
