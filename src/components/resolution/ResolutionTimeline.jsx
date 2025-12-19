import React, { useState, useEffect, useCallback } from 'react';
import DisputeDialog from './DisputeDialog';
import ResolutionDialog from './ResolutionDialog';
import { useSelector } from 'react-redux'; // Import useSelector to get theme

const ResolutionTimeline = ({ 
  resolutions = [], 
  onDispute = () => {}, 
  onProposeResolution = () => {}, 
  eventData = {}, 
  marketId = "" 
}) => {
  // State for dialogs
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);
  const [resolutionDialogOpen, setResolutionDialogOpen] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState({});
  
  // Get current theme
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === 'dark';
  
  // Get resolution window from eventData (default to 48 hours if not provided)
  const getResolutionWindow = useCallback(() => {
    // Try to find the current market in the event's sub_markets array
    const currentMarket = eventData?.sub_markets?.find(market => market._id === marketId);
    return currentMarket?.resolution_window; // Default to 48 hours if not specified
  }, [eventData, marketId]);

  // Calculate time remaining for a resolution
  const calculateTimeRemaining = useCallback((resolution) => {
    if (!resolution || !resolution.createdAt) return null;
    
    const createdAt = new Date(resolution.createdAt);
    const resolutionWindowHours = getResolutionWindow();
    const disputeDeadline = new Date(resolution.reviewed_at);
    disputeDeadline.setHours(disputeDeadline.getHours() + resolutionWindowHours);
    
    const now = new Date();
    const diffMs = disputeDeadline - now;
    
    if (diffMs <= 0) return { expired: true, hours: 0, minutes: 0 };
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return { expired: false, hours, minutes };
  }, [getResolutionWindow]);
  
  // Format date for nice display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Update timer for all resolutions
  useEffect(() => {
    // Check all approved proposals, not just the last one
    const approvedProposals = resolutions.filter(res => 
      res.status?.toLowerCase() === 'approved' && 
      res.resolution_type?.toLowerCase() !== 'dispute'
    );
    
    // Calculate remaining time for each approved proposal
    approvedProposals.forEach(resolution => {
      const resolutionId = resolution._id || `resolution-${resolutions.indexOf(resolution)}`;
      
      const updateTimer = () => {
        const remaining = calculateTimeRemaining(resolution);
        if (remaining) {
          setTimeRemaining(prev => ({
            ...prev,
            [resolutionId]: remaining
          }));
        }
      };
      
      // Update initially
      updateTimer();
    });
    
    // Set interval to update every minute
    const intervalId = setInterval(() => {
      approvedProposals.forEach(resolution => {
        const resolutionId = resolution._id || `resolution-${resolutions.indexOf(resolution)}`;
        const remaining = calculateTimeRemaining(resolution);
        if (remaining) {
          setTimeRemaining(prev => ({
            ...prev,
            [resolutionId]: remaining
          }));
        }
      });
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [resolutions, calculateTimeRemaining]);

  // Count the number of non-dispute outcomes in the resolution history
  const countOutcomes = () => {
    return resolutions.filter(
      resolution => resolution.resolution_type?.toLowerCase() !== 'dispute'
    ).length;
  };

  // Count the number of disputes in the resolution history
  const countDisputes = () => {
    return resolutions.filter(
      resolution => resolution.resolution_type?.toLowerCase() === 'dispute'
    ).length;
  };

  // Handle dispute button click
  const handleDisputeClick = (resolution) => {
    setSelectedResolution(resolution);
    setDisputeDialogOpen(true);
  };

  // Handle dispute submission success
  const handleDisputeSubmit = (data) => {
    // Close the dialog
    setDisputeDialogOpen(false);
    
    // Callback to parent if needed
    if (onDispute) {
      onDispute(data);
    }
  };

  // Handle propose resolution button click
  const handleProposeResolutionClick = (resolution) => {
    setSelectedResolution(resolution);
    setResolutionDialogOpen(true);
  };
  
  // Handle resolution submission success
  const handleResolutionSubmit = (data) => {
    // Close the dialog
    setResolutionDialogOpen(false);
    
    // Callback to parent if needed
    if (onProposeResolution) {
      onProposeResolution(data);
    }
  };

  // Get icon for timeline based on resolution type/status
  const getTimelineIcon = (resolution) => {
    const type = resolution.resolution_type?.toLowerCase() || '';
    const status = resolution.status?.toLowerCase() || '';
    
    if (type === 'dispute') {
      return (
        <div className="w-[26.67px] h-[26.67px] relative overflow-hidden">
          {/* Using hammer.svg from public folder */}
          <img src="/hammer.svg" alt="Dispute" className="w-full h-full" />
        </div>
      );
    } else if (status === 'rejected') {
      return (
        <div className="w-[26.67px] h-[26.67px] relative overflow-hidden">
          {/* Cross/X icon for rejected proposals */}
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M18 6L6 18" stroke="#FCFCFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 6L18 18" stroke="#FCFCFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      );
    } else {
      return (
        <div className="w-[26.67px] h-[26.67px] relative overflow-hidden">
          {/* Check/tick icon for proposed outcomes */}
          <img src="/tick.svg" alt="Dispute" className="w-full h-full" />
        </div>
      );
    }
  };

  // Get timeline title based on resolution type and proposed result
  const getTimelineTitle = (resolution, index) => {
    const type = resolution.resolution_type?.toLowerCase() || '';
    let result = resolution.proposed_result || '';
    
    // Capitalize the first letter of the result
    result = result.charAt(0).toUpperCase() + result.slice(1);
    
    // Find position of this outcome among all outcomes (not counting disputes)
    let outcomePosition = 0;
    for (let i = 0; i <= index; i++) {
      if (resolutions[i].resolution_type?.toLowerCase() !== 'dispute') {
        outcomePosition++;
      }
    }

    if (type === 'dispute') {
      return (
        <div className={`w-auto ${isDarkMode ? 'text-zinc-100' : 'text-[#2b2d2e]'} text-lg font-normal`}>
          Disputed
        </div>
      );
    } else {
      // Count disputes only up to the current index
      const disputesUpToIndex = resolutions
        .slice(0, index + 1)
        .filter(res => res.resolution_type?.toLowerCase() === 'dispute')
        .length;
        
      // Show "Final Outcome" when there are 2 or more disputes up to this point
      const titlePrefix = disputesUpToIndex >= 2 ? "Final Outcome" : "Outcome Proposed";
      
      return (
        <div className={`w-auto ${isDarkMode ? 'text-zinc-100' : 'text-[#2b2d2e]'} text-lg font-normal`}>
          {titlePrefix} - {result}
        </div>
      );
    }
  };

  // Check if this resolution is the last outcome and should show timer
  const shouldShowTimer = (resolution, index) => {
    const type = resolution.resolution_type?.toLowerCase() || '';
    
    // Don't show timer for disputes
    if (type === 'dispute') return false;
    
    // Find position among outcomes
    let outcomePosition = 0;
    for (let i = 0; i <= index; i++) {
      if (resolutions[i].resolution_type?.toLowerCase() !== 'dispute') {
        outcomePosition++;
      }
    }
    
    // Check if this proposal already has a dispute
    const hasDispute = resolutions.some(res => 
      res.resolution_type?.toLowerCase() === 'dispute' && 
      res.dispute_round === outcomePosition
    );
    
    // Don't show timer if this proposal already has a dispute
    if (hasDispute) return false;
    
    // Find last outcome index
    let lastOutcomeIndex = -1;
    for (let i = resolutions.length - 1; i >= 0; i--) {
      if (resolutions[i].resolution_type?.toLowerCase() !== 'dispute') {
        lastOutcomeIndex = i;
        break;
      }
    }
    
    // Show timer only if it's the last outcome and not the third
    return index === lastOutcomeIndex && outcomePosition !== 3;
  };

  // Get circle color based on status
  const getCircleColor = (resolution) => {
    const status = resolution.status?.toLowerCase() || '';
    if (status === 'rejected') {
      return 'bg-red-500';  // Use red color for rejected proposals
    }
    return status === 'pending' ? 'bg-gray-400' : 'bg-[#4169e1]';
  };

  // Check if dispute button should be shown for this resolution
  const shouldShowDisputeButton = (resolution, index) => {
    const type = resolution.resolution_type?.toLowerCase() || '';
    const status = resolution.status?.toLowerCase() || '';
    
    // Only show for non-dispute, approved proposals
    if (type === 'dispute' || status !== 'approved') return false;
    
    // Count the total number of disputes in the entire history
    const totalDisputes = countDisputes();
    
    // Don't show dispute button if 2 or more disputes have already been made
    if (totalDisputes >= 2) return false;
    
    // Find the last approved proposal index
    let lastAcceptedIndex = -1;
    for (let i = resolutions.length - 1; i >= 0; i--) {
      const res = resolutions[i];
      if (res.status?.toLowerCase() === 'approved' && 
          res.resolution_type?.toLowerCase() !== 'dispute') {
        lastAcceptedIndex = i;
        break;
      }
    }
    
    // Only show button for the last approved proposal
    if (index !== lastAcceptedIndex) return false;
    
    // Find the outcome position of this proposal
    let outcomePosition = 0;
    for (let i = 0; i <= index; i++) {
      if (resolutions[i].resolution_type?.toLowerCase() !== 'dispute') {
        outcomePosition++;
      }
    }
    
    // Check if this specific proposal already has a dispute
    const hasDispute = resolutions.some(res => 
      res.resolution_type?.toLowerCase() === 'dispute' && 
      res.dispute_round === outcomePosition
    );
    
    // Don't show dispute button if this proposal already has a dispute
    if (hasDispute) return false;
    
    // Check if dispute window has expired
    const resolutionId = resolution._id || `resolution-${index}`;
    const remaining = timeRemaining[resolutionId];
    
    // If we have timing information, make sure it hasn't expired
    if (remaining) {
      return !remaining.expired;
    }
    
    // For debugging
    console.log('No timing information for resolution:', resolutionId);
    
    // Fallback: show button anyway if it meets other criteria but no timing info
    // This ensures the button appears even if there's an issue with the timer
    return true;
  };

  // Check if propose resolution button should be shown for this resolution
  const shouldShowProposeResolutionButton = (resolution, index) => {
    const type = resolution.resolution_type?.toLowerCase() || '';
    const status = resolution.status?.toLowerCase() || '';
    
    // Only show for rejected proposals that aren't disputes
    if (status !== 'rejected' || type === 'dispute') return false;
    
    // Find the last rejected proposal
    let lastRejectedIndex = -1;
    for (let i = resolutions.length - 1; i >= 0; i--) {
      const res = resolutions[i];
      if (res.status?.toLowerCase() === 'rejected' && 
          res.resolution_type?.toLowerCase() !== 'dispute') {
        lastRejectedIndex = i;
        break;
      }
    }
    
    // Only show button if this is both:
    // 1. The last rejected proposal
    // 2. The last item in the resolutions list
    return index === lastRejectedIndex && index === resolutions.length - 1;
  };

  // If no resolutions, show a message
  if (!resolutions || resolutions.length === 0) {
    return (
      <div className={`py-4 text-center ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
        No resolution history available.
      </div>
    );
  }

  return (
    <div className="py-4 relative">
      {/* DisputeDialog component */}
      <DisputeDialog 
        isOpen={disputeDialogOpen}
        onClose={() => setDisputeDialogOpen(false)}
        eventData={eventData}
        marketId={marketId}
        resolution={selectedResolution}
        onSubmit={handleDisputeSubmit}
      />
      
      {/* ResolutionDialog component */}
      <ResolutionDialog 
        isOpen={resolutionDialogOpen}
        onClose={() => setResolutionDialogOpen(false)}
        eventData={eventData}
        marketId={marketId}
        resolution={selectedResolution}
        onSubmit={handleResolutionSubmit}
      />
      
      <div className="space-y-8">
        {resolutions.map((resolution, index) => {
          const circleColor = getCircleColor(resolution);
          const lineColor = index < resolutions.length - 1 ? 
                           (resolutions[index + 1].status?.toLowerCase() === 'pending' ? 'bg-gray-400' : 'bg-[#4169e1]') : 
                           '';
          const showDisputeButton = shouldShowDisputeButton(resolution, index);
          const showTimer = shouldShowTimer(resolution, index);
          const resolutionId = resolution._id || `resolution-${index}`;
          const remaining = timeRemaining[resolutionId];
          
          return (
            <div key={resolution._id || index} className="relative">
              {/* Connection line between circles - increased height from h-20 to h-28 */}
              {index < resolutions.length - 1 && (
                <div className={`absolute left-6 top-6 w-0.5 h-28 ${lineColor} z-0`}></div>
              )}
              
              <div className="flex items-center">
                {/* Timeline circle with icon */}
                <div className="relative z-10">
                  <div className={`w-12 h-12 p-[10.67px] ${circleColor} rounded-3xl inline-flex justify-center items-center gap-[8.89px]`}>
                    {getTimelineIcon(resolution)}
                  </div>
                </div>
                
                {/* Resolution timeline title and dispute button */}
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      {getTimelineTitle(resolution, index)}
                      
                      {/* Timer display - show only when dispute button is shown and this is the last resolution */}
                      {showDisputeButton && remaining && !remaining.expired && index === resolutions.length - 1 && (
                        <div className="text-orange-500 text-sm font-medium flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Dispute window: {remaining.hours}h {remaining.minutes}m remaining
                        </div>
                      )}
                      
                      {/* Expired timer message */}
                      {showTimer && remaining && remaining.expired && (
                        <div className="text-green-600 text-sm font-medium flex items-center">
                          Outcome confirmed (dispute window closed)
                        </div>
                      )}
                      
                      {/* Rejected proposal message */}
                      {resolution.status?.toLowerCase() === 'rejected' && (
                        <div className="text-red-500 text-sm font-medium flex items-center">
                          Proposal rejected
                        </div>
                      )}
                    </div>
                    
                    {/* Dispute button - only shown for approved, non-third outcomes with time remaining */}
                    {showDisputeButton && index === resolutions.length - 1 && (
                      <button
                        onClick={() => handleDisputeClick(resolution)}
                        className="ml-4 px-4 py-2 bg-red-500 text-white rounded-md text-sm   font-medium hover:bg-red-600 transition-colors"
                      >
                        Dispute
                      </button>
                    )}

                    {/* Propose Resolution button - only shown for rejected proposals */}
                    {shouldShowProposeResolutionButton(resolution, index) && (
                      <div 
                        onClick={() => handleProposeResolutionClick(resolution)}
                        className="ml-4 px-8 py-3 bg-[#4169e1] rounded-[5px] inline-flex justify-center items-center gap-2.5 cursor-pointer hover:bg-[#3658c7] transition-colors"
                      >
                        <div className="justify-center text-white text-base font-medium  ">
                          Propose Resolution
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Created date display */}
                  <div className={`${isDarkMode ? 'text-zinc-400' : 'text-gray-500'} text-sm`}>
                    {formatDate(resolution.createdAt || resolution.created_at)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResolutionTimeline;