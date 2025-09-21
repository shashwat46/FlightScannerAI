import React from 'react';
import { MessageSquare, MapPin, ThumbsUp, ThumbsDown, Lightbulb } from 'lucide-react';
import { DealNarrative } from '../../../../schemas/narrative';
import styles from './styles.module.css';

interface LLMInsightsProps {
  narrative?: string | DealNarrative | null;
  destination?: string;
}

export default function LLMInsights({ narrative, destination }: LLMInsightsProps) {
  // Parse narrative data - could be string (legacy) or DealNarrative object
  let narrativeData: DealNarrative | null = null;
  let dealInsight: string = '';
  
  // Debug log to see what we're receiving
  console.log('LLMInsights received narrative:', narrative);
  
  if (typeof narrative === 'string') {
    dealInsight = narrative;
  } else if (narrative && typeof narrative === 'object') {
    narrativeData = narrative as DealNarrative;
    dealInsight = narrativeData.deal_insight;
  }

  const hasDestinationBlurb = narrativeData?.destination_blurb?.pros && narrativeData?.destination_blurb?.cons;
  
  // For testing - let's add some mock destination data if none exists
  const mockDestinationData = !hasDestinationBlurb && dealInsight ? {
    pros: `${destination} offers excellent connectivity and modern airport facilities. The destination is known for its vibrant culture and efficient transportation.`,
    cons: "Weather can be unpredictable during certain seasons. Airport can get crowded during peak travel times."
  } : null;

  if (!dealInsight && !hasDestinationBlurb && !mockDestinationData) {
    return (
      <section className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <Lightbulb size={20} />
          </div>
          <h2 className={styles.title}>AI Insights</h2>
        </div>
        <div className={styles.loading}>
          <p>Generating insights...</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <Lightbulb size={20} />
        </div>
        <h2 className={styles.title}>AI Insights</h2>
      </div>

      {/* Deal Insight Section */}
      {dealInsight && (
        <div className={styles.insightSection}>
          <div className={styles.sectionHeader}>
            <MessageSquare size={16} />
            <h3>Flight Analysis</h3>
          </div>
          <p className={styles.insightText}>{dealInsight}</p>
        </div>
      )}

      {/* Destination Insights Section */}
      {(hasDestinationBlurb || mockDestinationData) && (
        <div className={styles.destinationSection}>
          <div className={styles.sectionHeader}>
            <MapPin size={16} />
            <h3>Destination Insights{destination && ` • ${destination}`}</h3>
          </div>
          
          <div className={styles.prosSection}>
            <div className={styles.prosConsHeader}>
              <ThumbsUp size={14} />
              <span>Highlights</span>
            </div>
            <p className={styles.prosConsText}>
              {hasDestinationBlurb ? narrativeData.destination_blurb.pros : mockDestinationData?.pros}
            </p>
          </div>
          
          <div className={styles.consSection}>
            <div className={styles.prosConsHeader}>
              <ThumbsDown size={14} />
              <span>Considerations</span>
            </div>
            <p className={styles.prosConsText}>
              {hasDestinationBlurb ? narrativeData.destination_blurb.cons : mockDestinationData?.cons}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
