

# **Manjha: A Strategic Report on Defining a Capital Preservation Platform for Advanced Zerodha Kite Derivatives Traders**

## **I. Executive Summary: The Strategic Mandate for Manjha**

#### **1.1 The Retail Derivatives Crisis: Structural Necessity for Discipline**

The foundation of the proposed FinTech product, Manjha, rests on addressing a profound structural market inefficiency within the Indian derivatives landscape: the persistent and catastrophic failure rate among retail traders. Data confirms that an overwhelming majority—**91% of individual traders engaged in the equity derivatives segment record losses**.1 This crisis establishes that the market’s primary deficiency is not a lack of trading opportunities or access to basic platforms, but rather a critical deficit in professional risk control, discipline, and execution efficiency. This high failure rate transforms the opportunity space for Manjha from a discretionary trading tool to an essential, mandatory capital preservation mechanism.

The root causes of these widespread losses identify the precise capability gap Manjha must fill. The regulatory body, SEBI, and industry analysts point to systemic issues: a general lack of financial understanding regarding the risks inherent in derivatives, aggressive speculative purposes, and, crucially, the manipulative influence of "Finfluencers" providing misleading or inadequately disclosed advice.1 However, the most compelling driver for a technology solution is the **Institutional Advantage**.1 Institutional players leverage sophisticated algorithmic trading systems for millisecond execution and reduced slippage, coupled with advanced risk management frameworks such as Value at Risk (VaR), stress testing, and scenario analysis. These capabilities, which anticipate and mitigate potential losses, are generally inaccessible to the average retail investor.1 Therefore, to survive in this environment, retail traders require a tool that democratizes these institutional risk controls.

The strategic imperative to focus on risk is further validated by regulatory action. SEBI has actively intervened, implementing measures such as the **recalibration of contract size** for equity derivatives and the **rationalization of weekly index derivatives products**.1 These steps, aimed at curbing speculative excess and mitigating risk, confirm that the regulatory environment supports—and perhaps implicitly demands—products focused on structured risk management. Manjha’s core design to enforce discipline positions it directly in alignment with the broader goal of promoting market integrity and protecting retail capital.

#### **1.2 Proposed Product Thesis: Manjha as the Institutional Risk Layer for Retail Traders**

Manjha is designed to serve the segment of advanced retail traders who have committed to high-volume Futures & Options (F\&O) activity on Zerodha Kite. This segment typically utilizes complex strategies but often succumbs to behavioral weaknesses or technical limitations during periods of high volatility. The thesis proposes that Manjha does not attempt to improve trading strategy—a crowded and regulated space—but rather focuses exclusively on enforcing disciplined execution and optimizing the costs associated with high-frequency trading.

The product targets users who are already willing to pay for advanced features, as evidenced by the high cost of the underlying technical infrastructure required to connect to Zerodha. The value proposition of Manjha is that it acts as a technological layer enhancing self-control and providing quantitative risk boundaries. By automating the most critical, discipline-heavy tasks—such as halting trading when a capital limit is breached—Manjha directly mitigates the behavioral risks that lead to large drawdowns, aiming to keep the committed trader within the profitable minority.

#### **1.3 Manjha: App Definition**

Name: Manjha  
Description (Tagline): A rope for your Kite\!  
**What is it:** Manjha is an advanced, API-powered **Discipline Engine** built exclusively for serious Futures & Options (F\&O) traders utilizing Zerodha Kite. It serves as a specialized, real-time risk mitigation layer designed to stabilize trading performance and address the structural reasons 91% of retail traders lose capital: the lack of institutional-grade control and execution efficiency.1

Manjha provides two core functions: **1\) Real-Time Risk Enforcement** and **2\) High-Speed Execution Optimization.** The Discipline Engine enforces strict, user-defined risk parameters—including automated maximum daily drawdown limits, configurable Value at Risk (VaR) warnings, and dynamic position sizing controls—by utilizing the Kite Connect API to pre-emptively manage orders and automatically flatten violating positions.

The High-Speed Execution layer offers a dark-theme, single-window terminal that bypasses Kite's core UI friction 2, providing lightning-fast F\&O execution coupled with a pre-trade cost analyzer to optimize brokerage expenditure, particularly mitigating costly F\&O set-off fees.3 Manjha is positioned as the essential, automated control system required for survival, consistency, and compliance in the volatile Indian derivatives landscape.

## **II. Market Validation: Pain Points and Capability Gaps**

The market validation for Manjha stems from two distinct areas of inadequacy within the current trading environment: explicit user friction within the Kite platform and the general structural deficiencies available to the retail derivatives trader.

#### **2.1 Zerodha Kite User Friction Analysis: The Day Trading Deficit**

Zerodha Kite’s success is rooted in its focus on simplicity and minimalism.2 While this design philosophy serves beginner and long-term investors well, it creates significant friction for the advanced day trader, particularly those in the volatile F\&O segment.

The key friction point is **execution speed and usability**. Day traders report that Kite’s interface requires them to "switch many windows to setup the trade and execute the order".2 For traders operating on short timeframes, this UI lag and manual process is intolerable, leading users to conclude that the Kite trading terminal is "not at all for day traders".2 This friction, which contributes directly to slippage and missed opportunities, confirms the necessity for Manjha to offer a dedicated, streamlined F\&O execution terminal. Furthermore, a highly requested cosmetic yet critical feature is a dark theme, as the current white, bright background causes "fatigued eyes" during extended trading sessions.2 While Zerodha has introduced features like a simplified order window allowing users to enter an investment amount instead of calculating quantity 5, this benefits beginners and does not resolve the high-speed, tactical order placement required by F\&O traders.

A second, highly critical pain point relates to **hidden cost erosion**. In an environment where flat-rate brokerage fees prevail, unexpected percentage-based charges can drastically reduce profitability. Specific fees cited as hurting traders include the high brokerage on the **physical settlement of stock F\&O, which amounts to 0.5% of the two-way trade value**.3 Although Zerodha explains this high charge by citing high risk involved, the fee is considered extremely burdensome in the current low-brokerage environment.3 Similarly, the brokerage on set-off F\&O trades—where two opposing positions cancel each other out—is levied at a total of 0.2%.3 This high percentage fee hurts, even when no physical delivery is involved. Manjha can address these losses by integrating a pre-trade cost analyzer that explicitly forecasts and attempts to minimize or avoid these specific, costly percentage-based fees, justifying its own subscription fee through quantifiable cost savings.

#### **2.2 The Structural and Regulatory Imperative: Risk Control as the Product**

The structural necessity for Manjha arises from the massive capability gap between institutional and retail trading, and the constraints imposed by regulation designed to stabilize the market.

Firstly, the **Institutional Advantage** 1 implies that retail traders who lack automated risk monitoring are competing blind. Manjha directly addresses this by retail-izing institutional tools like VaR and Max Drawdown, transforming these complex metrics into simple, automated execution rules. The ability to automatically flatten positions when a user-defined maximum loss limit is hit functions as a mandatory insurance policy, preventing the "speculative purpose" and "behavioral discipline failure" that drive the 91% loss rate.1

Secondly, the constraints of the **Kite Connect API** shape the product's focus. The API imposes explicit rate limits, including a maximum of **200 order placements per minute**.6 This restriction confirms that engaging in true High-Frequency Trading (HFT) is not feasible for retail users. Consequently, Manjha must prioritize the quality and intelligence of its order flow, focusing the limited execution capacity on critical, automated risk management triggers (like stop losses and position flattening) rather than relying on trade velocity. This technical constraint confirms that Manjha’s G2M strategy should be based on **smarter, rule-based execution** for capital preservation.

Finally, the regulatory landscape for algorithmic trading emphasizes control and compliance. SEBI guidelines state that retail traders using broker APIs can continue to automate trades provided they remain below exchange thresholds.7 However, commercial entities selling algos or strategies must formally register and partner with a broker.7 By designing Manjha as a **"Discipline Engine"** that executes *user-defined, personal risk parameters*—rather than selling "black-box" strategies—Manjha minimizes initial regulatory complexity, positioning itself as a personal risk enforcement tool.

## **III. Competitive Landscape and Ecosystem Mapping**

The competitive landscape for Manjha is characterized by Zerodha's dominant market position, a high-cost barrier for proprietary development via the Kite API, and a highly fragmented third-party ecosystem that validates the existence of specialized needs but leaves the core risk control segment underdeveloped.

#### **3.1 Broker and API Competitive Environment**

Zerodha’s immense user base (over 12 million users) 8 and brand trust are undeniable assets. However, the technical infrastructure for third-party development comes at a significant premium. The **Kite Connect API is notably expensive**, with retail users potentially facing fees of up to **₹2000 per month for the Connect API** and an additional **₹2000 per month for the Historical Data API**.6 Given that Manjha requires high-volume, real-time data streaming via WebSockets 9 and historical data for sophisticated VaR modeling, the full feature set mandates absorbing the higher recurring cost.

This premium pricing must be contrasted with emerging competitors like Angel One, which offers **free API access** for algorithmic trading.11 This cost disparity mandates that Manjha’s value proposition must overwhelmingly justify not just its own service fee, but also the high underlying Zerodha API fee, distinguishing itself from tools built on free infrastructure. The strategic decision to target Zerodha rests on the client base’s perceived trust and institutional stickiness, despite the higher operational costs compared to alternatives like Upstox Pro.4

#### **3.2 The Third-Party Application Ecosystem: Fragmentation and White Space**

The existence of numerous third-party applications confirms that Zerodha users are willing to pay for specialized add-ons, but these tools primarily occupy the "Strategy" or "Audit" spaces, leaving the critical "Enforcement" domain open for Manjha.

The **Strategy and Analysis** segment is occupied by platforms like **Sensibull** and **Quantsapp**.12 Sensibull is highly integrated with Zerodha, focusing on options strategies, learning, and real-time options data (Greeks, Open Interest, etc.).13 Sensibull focuses on helping users define the *trade strategy*. Manjha differentiates itself by explicitly focusing on **execution and control enforcement** *after* the strategy is defined. Manjha is thus complementary to strategy builders, ensuring disciplined execution and capital safety.

The **Journaling and Post-Trade Review** segment includes platforms like **TradesViz** and **TraderSync**.15 These tools provide comprehensive audits, AI summaries, R-multiple tracking, and historical drawdown visualization.16 This analysis is inherently backward-looking. Manjha’s strategy is to integrate these audit metrics (drawdown, R-multiple) into **forward-looking, real-time automated execution logic**. By automating the tracking and enforcement of R-multiple adherence and maximum daily drawdown limits, Manjha shifts the utility from retrospective analysis to pre-emptive control, preventing the catastrophic drawdown before it occurs.

The competitive analysis below summarizes the positioning:

Table 3: Manjha Positioning Against Key Third-Party Competitors

| Platform Category | Key Competitor(s) | Primary Function/Value | Manjha Focus (The White Space) | Competitive Strategy Rationale |
| :---- | :---- | :---- | :---- | :---- |
| Strategy/Pre-Trade Analysis | Sensibull 14, Quantsapp 12 | Strategy Generation, Option Data, Learning. | **Enforcement & Discipline:** Real-time risk control (Automated Drawdown/VaR). | Complementary: Focuses on execution safety post-strategy definition. |
| Execution/UI Speed | Zerodha Kite 2 | Simplicity, Minimalism. | **Speed Terminal:** High-speed, dark-mode, streamlined F\&O order placement. | Exploits Kite's inherent day trading deficiency for high-frequency users. |
| Post-Trade Audit/Analytics | TradesViz 16, TraderSync 15 | AI Insights, Historical Drawdown, R-multiple reporting. | **Pre-emptive Control:** Moves drawdown tracking into the automated execution logic. | Integrates analysis metrics for real-time risk mitigation, preventing the loss *before* it happens. |

## **IV. The Manjha Product Definition, Features, and Value Proposition**

#### **4.1 Core Value Proposition: Control, Compliance, and Optimization**

Manjha is defined as the "Professionalization Kit" for retail F\&O traders. The product converts risky, discretionary speculation into structured, automated risk management. The market opportunity lies in monetizing the trader's inherent fear of catastrophic loss—the outcome of the 91% loss statistic—by providing an essential safety net utilized by institutional participants.

#### **4.2 Detailed MVP Feature Matrix: The Discipline Engine**

The MVP is designed to address both the behavioral deficiencies of the trader and the execution deficiencies of the core Kite platform.

**1\. The Discipline Engine (Risk Core):**

* **Automated Max Drawdown Enforcement:** The user sets the maximum allowable cumulative capital loss per trading session or per specific strategy. If this pre-set loss threshold is breached, Manjha utilizes the Kite Connect API to automatically cancel all pending orders and issues an immediate market order to flatten all open F\&O positions. It then blocks any new order placement for a defined cooling-off period, physically enforcing capital preservation. This directly addresses the psychological failure that leads to outsized losses.1  
* **Simplified VaR Metrics:** The platform calculates and monitors Value at Risk based on the user's current F\&O portfolio exposure. This information triggers configurable, real-time alerts or position adjustments when potential exposure exceeds the established VaR limit, democratizing sophisticated institutional risk metrics for the retail user.1  
* **R-Multiple Adherence Monitor:** This system links position sizing to execution by utilizing established metrics.16 It prevents an entry order from being placed if the resulting risk exposure violates the user's pre-defined minimum risk-to-reward ratio.

**2\. The Speed Terminal (Execution Optimization):**

* **One-Click F\&O Ladder Trading:** A dedicated, low-latency execution interface is necessary, featuring a preferred dark-mode theme 2, designed for rapid trade entry. It is optimized for efficient management of complex multi-leg F\&O positions, such as strangles and straddles.17  
* **Brokerage Optimization Logic:** An integrated pre-trade calculator that forecasts all transaction costs. It specifically identifies the potential for the high **0.2% fee on F\&O set-off trades** 3, providing suggestions for optimal order placement to minimize hidden percentage-based erosion of marginal profits.

**3\. Compliance and API Management:**

* **Rate Limit Governor:** An intelligent queuing system that manages the flow of orders to the exchange, ensuring the stringent **200 orders per minute rate limit** imposed by the Kite API is never breached.6 This system prioritizes the transmission of critical orders (Stop Loss or Take Profit modifications) during high market volatility.  
* **Rule Playbook Generator:** This feature allows users to formally define, tag, and export their automated risk rules, converting internal self-discipline into a quantifiable, auditable "playbook".16

#### **4.3 Proposed Solution Architecture: Leveraging Kite Connect API**

The architecture relies on a secure remote backend server, mandatory for protecting the API secret and managing the authentication handshake.10

The **cost feasibility** is critical, as the pricing model must account for the upper-end API cost of approximately **₹4000 per month per user** for access to both Kite Connect and Historical Data 6, which is necessary for the full feature set. Manjha’s subscription must justify an additional service fee by demonstrating clear, measurable ROI via quantifiable risk prevention and cost optimization, targeting high-volume traders whose capital preservation needs supersede the premium cost.

The platform must utilize real-time data streaming via WebSockets 9 for immediate risk calculation and the REST API for order placement, modification, and cancellation.10 The system must strictly adhere to the Kite Connect authentication flow to ensure the API secret is never client-side.10

The constraints of the Kite Connect API dictate Manjha’s design philosophy, summarized below:

Table 4: Technical Feasibility: Kite Connect API Constraints and Manjha Mitigation

| Kite Connect Constraint | Details (Source ID) | Impact on Manjha | Manjha Mitigation Strategy |
| :---- | :---- | :---- | :---- |
| API/Data Cost | ₹2000/mo (Connect) \+ ₹2000/mo (Historical) 6 | High barrier to entry; mandates premium pricing model. | Target HNIs/High-Volume Traders for whom the cost is justified by risk saved. |
| Order Placement Rate Limit | 5-10 orders/sec, max 200/min 6 | HFT is impossible; execution must be smart and controlled. | Focus exclusively on automated risk management orders (SL/TP triggers) and strategic entries, prioritizing quality over speed. |
| Authentication Complexity | Requires API key/secret, redirect URL, remote backend 10 | High development complexity for retail access. | Abstract the complexity via a seamless, secure, web-based handshake process, simplifying the setup for non-coders. |
| Regulatory Compliance | Requires registration for strategy marketplaces 7 | Limits G2M to strategy selling. | Position Manjha as a **personal risk enforcement tool** (Grey Box) rather than a strategy provider, minimizing initial regulatory hurdles. |

## **V. Go-to-Market (G2M) Strategy and Monetization**

#### **5.1 Target Customer Segmentation and G2M Fit**

The ideal customer persona is the **Advanced Retail Algo Trader (ARAT)**. This segment comprises experienced F\&O traders with sufficient capital whose potential catastrophic losses substantially exceed the combined monthly cost of Manjha and the underlying API fees. These traders are motivated by consistency, capital preservation, and the need to automate discipline.

The G2M strategy must leverage Zerodha’s technical community by targeting users frequenting the Kite Connect Developer Portal 10 and forums discussing algo strategies.17 The existence of successful, paid add-ons like Sensibull 13 provides a template for G2M strategy, confirming user willingness to pay for specialized functionality.

#### **5.2 Pricing Model Recommendation: Value-Based Tiering**

The pricing model must position the total monthly cost as **risk insurance** and **capital preservation**.

* **Tier 1: Basic Discipline:** Focuses on UI speed and fundamental risk alerts. This tier is designed to demonstrate value quickly.  
* **Tier 2: Professional (Discipline Engine Core):** This is the core revenue tier, including VaR modeling, Automated Max Drawdown Enforcement, and Brokerage Optimization Logic. This price point must fully justify the cost of the premium API access (estimated at ₹4000/month) 6 plus the Manjha service fee.  
* **Tier 3: Institutional/Family:** Provides cross-account risk aggregation (similar to Console's Family Portfolio View 18) and customized support, targeting HNIs and sophisticated family offices.

#### **5.3 Strategic Partnerships and Compliance Pathway**

Seeking a formal partnership with Zerodha is highly recommended. Manjha should be presented as a tool that improves the quality and longevity of Zerodha's F\&O client base by reducing the number of catastrophic losers, thereby mitigating regulatory pressure related to the high retail loss rate.1

For regulatory positioning, Manjha must be marketed as a **"Grey-Box, Self-Regulation Tool"**. The emphasis must be on the system executing rules *defined entirely by the user*, distinguishing it from selling proprietary "black-box" strategies which require extensive SEBI registration and exchange empanelment.7 This focus minimizes the initial regulatory hurdles and aligns the product with SEBI’s overall goal of fostering disciplined trading.

## **VI. Conclusion and Strategic Synthesis**

The development of Manjha is strategically mandated by a significant and costly structural failure in the Indian retail derivatives market. The 91% loss rate 1 confirms that the market demands a solution focused on **control and capital preservation**, not merely strategy execution.

Manjha is defined as the necessary institutional risk layer for the retail trader, bridging the institutional advantage (VaR, automated limits) 1 with the limitations of the Zerodha platform (UI friction, specific high fees).2

The analysis confirms three primary strategic conclusions:

1. **Risk Mitigation Justifies Premium Pricing:** Manjha must be priced high enough to absorb the substantial estimated **₹4000 per month Kite Connect API fee**.6 This cost is justified only by positioning Manjha as an essential, automated defense against the $X,000 potential losses inherent in the 91% failure rate.  
2. **Product Focus is Enforcement:** To achieve market differentiation and reduce regulatory friction, Manjha must strictly focus on automated risk enforcement (Drawdown, VaR) and execution optimization (Speed Terminal, Brokerage Optimization), rather than strategy generation.  
3. **Target the Committed Capital Segment:** The ideal customer segment consists of Advanced Retail Algo Traders operating substantial capital who prioritize consistency and discipline, validating the high subscription cost through measurable risk reduction.

The successful entry of Manjha requires rigorous technical implementation, robust security protocols, and a G2M narrative that clearly positions automated discipline as the single most critical factor for survival in the Indian derivatives market.

Table 5: Manjha Value Justification: Addressing the 91% Problem

| Root Cause of Loss (91% statistic) | Evidence (Source ID) | Risk Management Failure Addressed | Manjha Feature Countermeasure |
| :---- | :---- | :---- | :---- |
| Lack of Institutional Risk Frameworks | 1 | Absence of structural loss protection (systemic risk). | Real-Time Automated Max Drawdown and Simplified VaR modeling. |
| Speculation/Behavioral Discipline Failure | 1 | Psychological inability to adhere to trading rules. | Discipline Engine: Enforces compliance by blocking or flattening positions automatically. |
| Execution Friction/Slippage | 2 | Delay between opportunity recognition and trade entry. | Dedicated F\&O Speed Terminal (Dark Mode UI) and priority order queuing. |
| High, Unexpected Transaction Costs | 3 | Erosion of marginal profits due to specific fees. | Pre-Execution Brokerage Optimization (F\&O Set-Off Fee forecasting). |

#### **Works cited**

1. India's Derivatives Market and Retail Investors \- CFA Institute Market ..., accessed November 17, 2025, [https://blogs.cfainstitute.org/marketintegrity/2025/11/05/indias-derivatives-market-and-retail-investors/](https://blogs.cfainstitute.org/marketintegrity/2025/11/05/indias-derivatives-market-and-retail-investors/)  
2. Honest review and request for Zerodha, accessed November 17, 2025, [https://tradingqna.com/t/honest-review-and-request-for-zerodha/85958](https://tradingqna.com/t/honest-review-and-request-for-zerodha/85958)  
3. Pain points for Zerodha \- F\&O \- Trading Q\&A by Zerodha \- All your ..., accessed November 17, 2025, [https://tradingqna.com/t/pain-points-for-zerodha/134876](https://tradingqna.com/t/pain-points-for-zerodha/134876)  
4. Zerodha vs Groww vs Upstox- Which is Better? \- BillCut, accessed November 17, 2025, [https://www.billcut.com/blogs/zerodha-vs-groww-vs-upstox-which-is-better/](https://www.billcut.com/blogs/zerodha-vs-groww-vs-upstox-which-is-better/)  
5. What's new at Zerodha: 2024, accessed November 17, 2025, [https://zerodha.com/z-connect/general/whats-new-at-zerodha-2024](https://zerodha.com/z-connect/general/whats-new-at-zerodha-2024)  
6. Is Zerodha API (Algo Trading) Review \- Chittorgarh, accessed November 17, 2025, [https://www.chittorgarh.com/broker/zerodha/api-for-algo-trading-review/18/](https://www.chittorgarh.com/broker/zerodha/api-for-algo-trading-review/18/)  
7. Explaining the latest SEBI algo trading regulations – Z-Connect by Zerodha, accessed November 17, 2025, [https://zerodha.com/z-connect/business-updates/explaining-the-latest-sebi-algo-trading-regulations](https://zerodha.com/z-connect/business-updates/explaining-the-latest-sebi-algo-trading-regulations)  
8. Best Option Trading Platforms/Apps in India, 2025 \- Strike Money, accessed November 17, 2025, [https://www.strike.money/options/best-option-trading-platforms-apps-india](https://www.strike.money/options/best-option-trading-platforms-apps-india)  
9. What are the charges for Kite APIs, and what types of subscription plans are available? \- Support Zerodha, accessed November 17, 2025, [https://support.zerodha.com/category/trading-and-markets/general-kite/kite-api/articles/what-are-the-charges-for-kite-apis](https://support.zerodha.com/category/trading-and-markets/general-kite/kite-api/articles/what-are-the-charges-for-kite-apis)  
10. Kite Connect 3 / API documentation, accessed November 17, 2025, [https://kite.trade/docs/connect/v3/](https://kite.trade/docs/connect/v3/)  
11. Zerodha vs Angel One:Ultimate Comparison \- Entri Blog, accessed November 17, 2025, [https://entri.app/blog/zerodha-vs-angel-one/](https://entri.app/blog/zerodha-vs-angel-one/)  
12. Quantsapp: India's Largest Options Trading Analytics Platform, accessed November 17, 2025, [https://www.quantsapp.com/](https://www.quantsapp.com/)  
13. Sensibull for Options Trading \- Apps on Google Play, accessed November 17, 2025, [https://play.google.com/store/apps/details?id=com.sensibull.mobile\&hl=en\_US](https://play.google.com/store/apps/details?id=com.sensibull.mobile&hl=en_US)  
14. Sensibull \- India's Largest Options Trading Platform, accessed November 17, 2025, [https://sensibull.com/](https://sensibull.com/)  
15. Trading Journal for Zerodha \- TraderSync, accessed November 17, 2025, [https://tradersync.com/broker/zerodha/](https://tradersync.com/broker/zerodha/)  
16. Zerodha TradesViz Free Trading Journal Integration, accessed November 17, 2025, [https://www.tradesviz.com/brokers/Zerodha](https://www.tradesviz.com/brokers/Zerodha)  
17. Algorithms and Strategies \- Kite Connect developer forum, accessed November 17, 2025, [https://kite.trade/forum/categories/algorithms-and-strategies/p2](https://kite.trade/forum/categories/algorithms-and-strategies/p2)  
18. Introducing family portfolio view on Console – Z-Connect by Zerodha, accessed November 17, 2025, [https://zerodha.com/z-connect/console/introducing-family-portfolio-view-on-console](https://zerodha.com/z-connect/console/introducing-family-portfolio-view-on-console)