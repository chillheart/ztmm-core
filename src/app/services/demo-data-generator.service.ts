import { Injectable } from '@angular/core';
import { ZtmmDataWebService } from './ztmm-data-web.service';
import { AssessmentStatus, Pillar, FunctionCapability, TechnologyProcess } from '../models/ztmm.models';

interface DemoTechnologyProcess {
  name: string;
  description: string;
  type: 'Technology' | 'Process';
  maturityStageId: number;
}

@Injectable({
  providedIn: 'root'
})
export class DemoDataGeneratorService {

  constructor(private dataService: ZtmmDataWebService) {}

  // Comprehensive demo data for each function and capability emulating an Azure environment
  // Each function/capability has at least 2 technologies and 2 processes for each maturity stage
  // NOTE: This is AI-generated demonstration data designed to showcase the assessment tool's capabilities.
  // It is not intended to be an all-encompassing list of security technologies and processes, nor should
  // it be considered a complete or real-world Zero Trust architecture. This data is for demonstration
  // purposes only and should not be used as actual security guidance for production environments.
  private readonly demoData: Record<string, DemoTechnologyProcess[]> = {
    // Identity Pillar - Authentication Function
    'Authentication': [
      // Traditional (1)
      { name: 'Basic Username/Password Authentication', description: 'Foundational authentication method representing the starting point before implementing more advanced identity security measures. Essential for establishing baseline access control.', type: 'Technology', maturityStageId: 1 },
      { name: 'VPN with Pre-shared Keys', description: 'Remote access solution using shared cryptographic keys for secure network connectivity. Legacy technology providing basic encrypted tunnels before implementing modern identity-based and zero-trust network access.', type: 'Technology', maturityStageId: 1 },
      { name: 'Manual Password Reset Process', description: 'Basic manual procedure for password management. Represents traditional IT support processes before implementing self-service and automated identity management capabilities.', type: 'Process', maturityStageId: 1 },
      { name: 'Basic User Account Management', description: 'Fundamental user administration procedures. Essential baseline process that organizations must have before advancing to automated and policy-driven identity management.', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { name: 'Azure Active Directory Basic', description: 'Cloud-based identity service that enables initial modernization of authentication infrastructure. Key first step in transitioning from traditional on-premises identity to cloud-hybrid models.', type: 'Technology', maturityStageId: 2 },
      { name: 'Single Sign-On (SSO)', description: 'Centralized authentication that improves user experience and security. Critical technology for Initial stage as it reduces password sprawl and enables better access monitoring.', type: 'Technology', maturityStageId: 2 },
      { name: 'Multi-Factor Authentication Policy Framework', description: 'Structured approach to implementing additional authentication factors. Essential Initial stage process for establishing security policies beyond basic passwords.', type: 'Process', maturityStageId: 2 },
      { name: 'Password Complexity Requirements', description: 'Standardized password policies that strengthen basic authentication. Important Initial stage process for improving security while maintaining familiar authentication methods.', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { name: 'Azure Active Directory Multi-Factor Authentication', description: 'Cloud-based identity protection requiring multiple authentication factors with risk-based policies. Machine learning-enhanced technology providing adaptive security based on user behavior and context analysis.', type: 'Technology', maturityStageId: 3 },
      { name: 'Microsoft Authenticator App', description: 'Modern authentication app enabling passwordless and push notifications. Advanced stage technology that supports seamless multi-factor authentication workflows.', type: 'Technology', maturityStageId: 3 },
      { name: 'Passwordless Authentication Rollout Process', description: 'Strategic implementation of modern authentication methods. Advanced process for transitioning users from traditional passwords to more secure authentication methods.', type: 'Process', maturityStageId: 3 },
      { name: 'Authentication Risk Assessment Procedures', description: 'Continuous evaluation of authentication security posture. Advanced process that enables proactive identification and mitigation of identity-related risks.', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { name: 'Azure AD Passwordless Authentication', description: 'Eliminates passwords entirely using biometrics, FIDO2, or certificates. Optimal stage technology representing the pinnacle of user authentication security and experience.', type: 'Technology', maturityStageId: 4 },
      { name: 'Biometric Authentication Systems', description: 'Biometric verification using fingerprint, facial recognition, or iris scanning for password-free authentication. Cutting-edge technology providing highest security with seamless user experience and hardware-backed protection.', type: 'Technology', maturityStageId: 4 },
      { name: 'Zero-Trust Authentication Framework', description: 'Comprehensive never-trust, always-verify authentication model. Optimal process that continuously validates user identity and device posture for every access request.', type: 'Process', maturityStageId: 4 },
      { name: 'Continuous Authentication Validation', description: 'Real-time assessment of user behavior and context throughout sessions. Optimal process providing dynamic security that adapts to changing risk conditions automatically.', type: 'Process', maturityStageId: 4 }
    ],

    // Identity Pillar - Identity Stores Function
    'Identity Stores': [
      // Traditional (1)
      { name: 'On-Premises Active Directory', description: 'Windows Server-based directory service for user authentication and authorization in enterprise environments. Foundational technology representing the starting point for most enterprise identity infrastructures.', type: 'Technology', maturityStageId: 1 },
      { name: 'Local User Account Databases', description: 'Standalone user databases for individual applications. Traditional approach that creates identity silos, included here as the baseline before implementing centralized identity management.', type: 'Technology', maturityStageId: 1 },
      { name: 'Manual User Provisioning', description: 'Manual creation and management of user accounts. Traditional process representing the foundation before implementing automated identity lifecycle management.', type: 'Process', maturityStageId: 1 },
      { name: 'Basic Account Lifecycle Management', description: 'Fundamental procedures for managing user accounts from creation to deletion. Essential Traditional process that establishes the foundation for more sophisticated identity governance.', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { name: 'Azure AD Connect', description: 'Hybrid identity synchronization tool connecting on-premises and cloud directories. Key Initial stage technology for organizations beginning their cloud identity journey.', type: 'Technology', maturityStageId: 2 },
      { name: 'Hybrid Identity Infrastructure', description: 'Combined on-premises and cloud identity architecture. Initial stage approach that enables gradual transition from traditional directory services to cloud-based identity.', type: 'Technology', maturityStageId: 2 },
      { name: 'Identity Lifecycle Management Process', description: 'Structured approach to managing user identities throughout their organizational tenure. Initial process that introduces governance and consistency to identity operations.', type: 'Process', maturityStageId: 2 },
      { name: 'Directory Synchronization Procedures', description: 'Systematic processes for maintaining identity consistency across multiple directories. Critical Initial process for ensuring data integrity in hybrid identity environments.', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { name: 'Azure Active Directory Premium', description: 'Enterprise cloud identity platform with enhanced security, conditional access, and management features. Full-featured technology providing sophisticated identity protection and governance capabilities.', type: 'Technology', maturityStageId: 3 },
      { name: 'Azure AD B2B/B2C', description: 'Business-to-business and business-to-consumer identity solutions. Advanced technology enabling secure external collaboration and customer identity management.', type: 'Technology', maturityStageId: 3 },
      { name: 'Guest User Management Workflow', description: 'Structured processes for managing external user access. Advanced process ensuring secure and compliant external collaboration while maintaining security boundaries.', type: 'Process', maturityStageId: 3 },
      { name: 'Automated Identity Synchronization', description: 'Automated processes for maintaining identity consistency across systems. Advanced process that reduces manual effort and improves accuracy in identity management.', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { name: 'Azure AD Cloud-Only Infrastructure', description: 'Fully cloud-native identity architecture eliminating on-premises dependencies. Optimal technology representing the pinnacle of identity infrastructure modernization and scalability.', type: 'Technology', maturityStageId: 4 },
      { name: 'Federated Identity Management', description: 'Cross-organizational identity federation enabling seamless access across multiple platforms and partners. Enterprise-grade technology for complex multi-organization and partner ecosystems.', type: 'Technology', maturityStageId: 4 },
      { name: 'Self-Service Identity Management', description: 'User-driven identity management capabilities with appropriate governance controls. Optimal process that maximizes user productivity while maintaining security and compliance.', type: 'Process', maturityStageId: 4 },
      { name: 'AI-Driven Identity Analytics', description: 'Machine learning-powered insights into identity usage patterns and security risks. Optimal process providing predictive capabilities for proactive identity management.', type: 'Process', maturityStageId: 4 }
    ],

    // Identity Pillar - Risk Assessments Function
    'Risk Assessments': [
      // Traditional (1)
      { name: 'Manual Security Audits', description: 'Basic manual review processes for identifying security vulnerabilities. Traditional approach providing the foundation for security assessment before implementing automated risk detection tools.', type: 'Technology', maturityStageId: 1 },
      { name: 'Basic Logging Systems', description: 'Simple event logging and record-keeping systems. Essential Traditional technology that provides the data foundation needed for more advanced risk assessment capabilities.', type: 'Technology', maturityStageId: 1 },
      { name: 'Periodic Manual Risk Reviews', description: 'Scheduled manual evaluation of security risks and vulnerabilities. Traditional process establishing the discipline of regular risk assessment before automation and continuous monitoring.', type: 'Process', maturityStageId: 1 },
      { name: 'Basic Incident Response Procedures', description: 'Fundamental processes for responding to security incidents. Traditional process providing the essential framework for incident management before advanced threat detection and response.', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { name: 'Azure AD Sign-In Logs', description: 'Cloud-based authentication logging providing initial visibility into user access patterns. Initial stage technology that enables basic monitoring and analysis of identity-related activities.', type: 'Technology', maturityStageId: 2 },
      { name: 'Basic Risk Detection Tools', description: 'Simple automated tools for identifying common security risks. Initial technology that introduces automation to risk assessment while maintaining manageable complexity.', type: 'Technology', maturityStageId: 2 },
      { name: 'Identity Risk Assessment Framework', description: 'Structured approach to evaluating identity-related security risks. Initial process that brings methodology and consistency to identity risk management practices.', type: 'Process', maturityStageId: 2 },
      { name: 'Regular Access Reviews', description: 'Systematic evaluation of user access rights and permissions. Critical Initial process for ensuring appropriate access and identifying access creep before implementing automated governance.', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { name: 'Azure AD Identity Protection', description: 'Machine learning-based identity risk detection and automated protection against compromised accounts. AI-powered technology providing sophisticated threat detection and automated response capabilities for identity security.', type: 'Technology', maturityStageId: 3 },
      { name: 'Azure AD Risk-Based Conditional Access', description: 'Dynamic access controls based on real-time risk assessment. Advanced technology that adapts security controls based on calculated risk levels and contextual factors.', type: 'Technology', maturityStageId: 3 },
      { name: 'Risk-Based Access Review Process', description: 'Access review methodology incorporating risk scoring and prioritization for efficient governance. Risk-aware process that focuses effort on highest-risk access relationships and scenarios.', type: 'Process', maturityStageId: 3 },
      { name: 'Identity Threat Investigation Procedures', description: 'Sophisticated processes for investigating and responding to identity-based threats. Advanced process enabling detailed forensics and threat hunting for identity security incidents.', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { name: 'Microsoft Defender for Identity', description: 'Threat protection platform specifically designed for Active Directory environments with behavioral analysis. Comprehensive technology providing identity infrastructure protection with AI-powered threat detection.', type: 'Technology', maturityStageId: 4 },
      { name: 'AI-Powered Behavioral Analytics', description: 'Machine learning-based analysis of user behavior patterns to detect anomalies. Optimal technology that provides predictive threat detection and advanced security insights.', type: 'Technology', maturityStageId: 4 },
      { name: 'Automated Risk Remediation', description: 'Intelligent automated response to identified risks and threats. Optimal process that provides real-time threat mitigation without human intervention while maintaining security effectiveness.', type: 'Process', maturityStageId: 4 },
      { name: 'Predictive Risk Modeling', description: 'Analytics platform predicting future security risks based on current data trends and behavioral patterns. Forecasting process enabling proactive security posture management and strategic risk planning.', type: 'Process', maturityStageId: 4 }
    ],

    // Identity Pillar - Access Management Function
    'Access Management': [
      // Traditional (1)
      { name: 'Manual Access Control Lists', description: 'Manual configuration of data access permissions and restrictions. Traditional technology requiring manual administration before implementing automated access governance and policy-driven controls.', type: 'Technology', maturityStageId: 1 },
      { name: 'Basic File Permissions', description: 'Fundamental file system access controls for restricting data access by user and group. Traditional technology providing basic data security before implementing advanced access controls and data loss prevention.', type: 'Technology', maturityStageId: 1 },
      { name: 'Manual Access Request Process', description: 'Manual procedures for requesting and approving user access to systems and resources. Traditional process establishing the foundation for access governance before automated workflows.', type: 'Process', maturityStageId: 1 },
      { name: 'Quarterly Access Reviews', description: 'Periodic manual review of user access rights and permissions. Traditional process providing basic access governance before implementing continuous monitoring and automated reviews.', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { name: 'Role-Based Access Control (RBAC)', description: 'Structured access management using predefined roles and permissions. Initial technology that introduces organization and scalability to access management while reducing administrative overhead.', type: 'Technology', maturityStageId: 2 },
      { name: 'Group-Based Permissions', description: 'Access control using group membership to manage permissions efficiently. Initial technology that simplifies access administration and provides better control over resource access.', type: 'Technology', maturityStageId: 2 },
      { name: 'Role-Based Access Control Framework', description: 'Structured methodology for implementing and managing role-based access controls. Initial process that brings consistency and governance to access management practices.', type: 'Process', maturityStageId: 2 },
      { name: 'Standardized Access Request Workflow', description: 'Formalized processes for requesting, reviewing, and approving access to resources. Initial process that introduces structure and auditability to access provisioning activities.', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { name: 'Azure AD Conditional Access', description: 'Policy-driven access controls making real-time decisions based on context and risk factors. Intelligent technology providing dynamic access decisions based on user, device, location, and risk conditions.', type: 'Technology', maturityStageId: 3 },
      { name: 'Azure AD Access Reviews', description: 'Automated and systematic review of user access rights and permissions. Advanced technology that streamlines access governance and ensures compliance with access policies.', type: 'Technology', maturityStageId: 3 },
      { name: 'Privileged Access Management Process', description: 'Specialized procedures for managing high-privilege accounts and access. Advanced process that provides enhanced security and monitoring for sensitive administrative access.', type: 'Process', maturityStageId: 3 },
      { name: 'Regular Access Certification Workflow', description: 'Systematic process for certifying and validating ongoing access appropriateness. Advanced process ensuring access remains aligned with business needs and security requirements.', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { name: 'Azure AD Privileged Identity Management', description: 'Just-in-time access management platform for privileged roles with approval workflows and monitoring. Premium technology providing the highest level of protection for administrative access with time-bound permissions.', type: 'Technology', maturityStageId: 4 },
      { name: 'Zero Standing Privileges', description: 'Architecture eliminating permanent administrative privileges in favor of just-in-time access. Optimal technology that minimizes attack surface while maintaining operational effectiveness.', type: 'Technology', maturityStageId: 4 },
      { name: 'Just-In-Time Access Management', description: 'Security process providing temporary elevated access only when needed with approval workflows. Precision process that balances security and productivity by eliminating unnecessary standing privileges.', type: 'Process', maturityStageId: 4 },
      { name: 'Continuous Access Evaluation', description: 'Real-time assessment and adjustment of access rights based on changing conditions. Optimal process providing dynamic access control that adapts to evolving risk and business contexts.', type: 'Process', maturityStageId: 4 }
    ],

    // Identity Pillar - Visibility & Analytics Capability
    'Visibility & Analytics': [
      // Traditional (1)
      { name: 'Basic Event Logs', description: 'Simple system and application event logging providing basic visibility into system activities. Traditional technology establishing the foundation for security monitoring and analysis.', type: 'Technology', maturityStageId: 1 },
      { name: 'Manual Log Review Tools', description: 'Basic tools for manually examining and analyzing log files. Traditional technology providing initial capability for investigating security events and system behavior.', type: 'Technology', maturityStageId: 1 },
      { name: 'Weekly Manual Log Reviews', description: 'Scheduled manual examination of system and security logs. Traditional process establishing the discipline of regular security monitoring before automated analysis tools.', type: 'Process', maturityStageId: 1 },
      { name: 'Basic Incident Documentation', description: 'Fundamental procedures for recording and tracking security incidents. Traditional process providing the foundation for incident management and security improvement.', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { name: 'Azure AD Reporting and Analytics', description: 'Cloud-based reporting tools providing insights into identity and access activities. Initial technology that enables better visibility and understanding of user access patterns.', type: 'Technology', maturityStageId: 2 },
      { name: 'Centralized Log Management', description: 'Consolidated collection and storage of logs from multiple systems. Initial technology that improves log accessibility and enables more effective security monitoring.', type: 'Technology', maturityStageId: 2 },
      { name: 'Identity Analytics Dashboard Creation', description: 'Development of visual dashboards for monitoring identity-related metrics and activities. Initial process that improves visibility and decision-making for identity management.', type: 'Process', maturityStageId: 2 },
      { name: 'Regular Security Reporting', description: 'Systematic creation and distribution of security status reports and metrics. Initial process that provides stakeholders with regular security posture visibility.', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { name: 'Azure Monitor for Identity', description: 'Comprehensive monitoring platform providing identity infrastructure visibility with analytics and alerting. Enterprise monitoring technology offering sophisticated monitoring, alerting, and analysis capabilities for identity systems.', type: 'Technology', maturityStageId: 3 },
      { name: 'PowerBI for Identity Dashboards', description: 'Business intelligence platform for identity analytics with interactive visualizations and reporting. Data visualization technology providing sophisticated reporting and analytics capabilities for identity management.', type: 'Technology', maturityStageId: 3 },
      { name: 'Security Incident Response for Identity', description: 'Specialized incident response procedures for identity-related security events. Advanced process ensuring rapid and effective response to identity security incidents.', type: 'Process', maturityStageId: 3 },
      { name: 'Identity Compliance Reporting Process', description: 'Systematic procedures for generating compliance reports and demonstrating regulatory adherence. Governance process supporting audit requirements and compliance management across identity systems.', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { name: 'Microsoft Sentinel for Identity', description: 'AI-powered security information and event management (SIEM) with advanced identity analytics. Optimal technology providing comprehensive threat detection and automated response capabilities.', type: 'Technology', maturityStageId: 4 },
      { name: 'Real-time Identity Analytics', description: 'Live analysis platform for identity events and behavioral patterns with instant alerting. Streaming analytics technology enabling immediate threat detection and dynamic security response.', type: 'Technology', maturityStageId: 4 },
      { name: 'Proactive Threat Hunting', description: 'Security methodology actively searching for threats and anomalies in identity systems before they cause damage. Investigative process providing proactive security through continuous threat discovery and analysis.', type: 'Process', maturityStageId: 4 },
      { name: 'Automated Incident Response', description: 'Intelligent automated response to security incidents and threats. Optimal process providing immediate threat mitigation without human intervention while maintaining effectiveness.', type: 'Process', maturityStageId: 4 }
    ],

    // Identity Pillar - Automation & Orchestration Capability
    'Automation & Orchestration': [
      // Traditional (1)
      { name: 'Manual Workflow Processes', description: 'Basic manual procedures for identity management tasks. Traditional approach providing the foundation for identity operations before implementing automated workflows and orchestration tools.', type: 'Technology', maturityStageId: 1 },
      { name: 'Basic Script Automation', description: 'Simple scripting solutions for repetitive identity tasks. Traditional technology that introduces basic automation concepts before adopting comprehensive orchestration platforms.', type: 'Technology', maturityStageId: 1 },
      { name: 'Manual Identity Provisioning', description: 'Manual user account creation and management procedures. Traditional process representing the baseline approach before implementing automated identity lifecycle management.', type: 'Process', maturityStageId: 1 },
      { name: 'Email-Based Request Processing', description: 'Email-driven procedures for processing identity and access requests. Traditional process that establishes request workflows before implementing self-service and automated systems.', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { name: 'PowerShell Automation Scripts', description: 'Scripted automation for common identity management tasks. Initial stage technology that provides more sophisticated automation while remaining manageable for most IT teams.', type: 'Technology', maturityStageId: 2 },
      { name: 'Basic Workflow Management', description: 'Simple workflow engines for managing identity processes. Initial technology that introduces structured automation and approval processes to identity management.', type: 'Technology', maturityStageId: 2 },
      { name: 'Semi-Automated Provisioning Process', description: 'Partially automated user provisioning with manual approval steps. Initial process that balances automation benefits with governance and control requirements.', type: 'Process', maturityStageId: 2 },
      { name: 'Standardized Request Forms', description: 'Consistent forms and procedures for identity and access requests. Initial process that brings structure and standardization to access management workflows.', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { name: 'Azure Logic Apps for Identity Workflows', description: 'Cloud-based workflow automation platform for complex identity processes. Advanced technology enabling sophisticated orchestration and integration with multiple identity systems.', type: 'Technology', maturityStageId: 3 },
      { name: 'Microsoft Graph API Integration', description: 'Programmatic integration with Microsoft identity services for automated operations. Advanced technology that enables seamless automation across the Microsoft ecosystem.', type: 'Technology', maturityStageId: 3 },
      { name: 'Automated Identity Provisioning Process', description: 'Fully automated user lifecycle management with policy-driven provisioning. Advanced process that eliminates manual intervention while maintaining security and compliance.', type: 'Process', maturityStageId: 3 },
      { name: 'Self-Service Access Request Workflow', description: 'User-driven access requests with automated approval workflows. Advanced process that improves user experience while maintaining appropriate governance controls.', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { name: 'Azure AD Entitlement Management', description: 'Comprehensive identity governance platform with advanced lifecycle management. Optimal technology providing the most sophisticated identity automation and governance capabilities available.', type: 'Technology', maturityStageId: 4 },
      { name: 'AI-Driven Workflow Optimization', description: 'Machine learning-powered optimization of identity workflows and processes. Optimal technology that continuously improves identity operations through intelligent automation.', type: 'Technology', maturityStageId: 4 },
      { name: 'Automated Compliance Remediation Process', description: 'AI-powered automatic correction of compliance violations and policy deviations. Optimal process providing proactive compliance management without human intervention.', type: 'Process', maturityStageId: 4 },
      { name: 'Intelligent Access Lifecycle Management', description: 'AI-enhanced identity lifecycle management with predictive provisioning and deprovisioning. Optimal process representing the pinnacle of identity automation maturity.', type: 'Process', maturityStageId: 4 }
    ],

    // Identity Pillar - Governance Capability
    'Governance': [
      // Traditional (1)
      { name: 'Manual Policy Documentation', description: 'Human-created documentation of security policies and compliance requirements for applications. Traditional technology providing basic governance before implementing automated policy management and compliance monitoring.', type: 'Technology', maturityStageId: 1 },
      { name: 'Basic Compliance Tracking', description: 'Simple spreadsheet or document-based tracking of compliance requirements. Traditional technology establishing baseline compliance monitoring before advanced governance tools.', type: 'Technology', maturityStageId: 1 },
      { name: 'Annual Compliance Audits', description: 'Yearly compliance reviews and assessments of identity governance practices. Traditional process providing periodic governance oversight before implementing continuous monitoring.', type: 'Process', maturityStageId: 1 },
      { name: 'Manual Policy Enforcement', description: 'Manual review and enforcement of identity policies and procedures. Traditional process establishing governance discipline before automated policy enforcement mechanisms.', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { name: 'Policy Management Systems', description: 'Dedicated systems for managing and tracking identity governance policies. Initial technology that centralizes policy management and improves consistency in governance practices.', type: 'Technology', maturityStageId: 2 },
      { name: 'Basic Governance Dashboards', description: 'Simple dashboards providing visibility into identity governance metrics and compliance status. Initial technology that improves governance oversight and reporting capabilities.', type: 'Technology', maturityStageId: 2 },
      { name: 'Identity Governance Policy Framework', description: 'Structured framework for developing and implementing identity governance policies. Initial process that brings consistency and comprehensiveness to governance practices.', type: 'Process', maturityStageId: 2 },
      { name: 'Quarterly Governance Reviews', description: 'Regular quarterly assessments of identity governance effectiveness and compliance. Initial process that increases the frequency and rigor of governance oversight.', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { name: 'PowerBI for Identity Governance Reporting', description: 'Business intelligence platform for comprehensive identity governance analytics with executive dashboards. Data visualization technology providing sophisticated reporting and insights for governance decision-making.', type: 'Technology', maturityStageId: 3 },
      { name: 'Automated Policy Compliance Monitoring', description: 'Automated systems that continuously monitor and report on policy compliance. Advanced technology that provides real-time governance oversight and violation detection.', type: 'Technology', maturityStageId: 3 },
      { name: 'Data Access Governance Process', description: 'Comprehensive procedures for governing access to sensitive data and resources. Advanced process that extends governance beyond identity to include data protection and privacy.', type: 'Process', maturityStageId: 3 },
      { name: 'Identity Compliance Audit Procedures', description: 'Sophisticated audit procedures specifically designed for identity governance and compliance. Advanced process providing thorough and systematic governance validation.', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { name: 'Azure AD Governance Suite', description: 'Comprehensive cloud-based governance platform with advanced analytics and automation. Optimal technology providing the most sophisticated identity governance capabilities available.', type: 'Technology', maturityStageId: 4 },
      { name: 'Microsoft Purview Identity Governance', description: 'Unified governance platform integrating identity and data governance across hybrid environments. Comprehensive technology offering complete governance across the entire information landscape.', type: 'Technology', maturityStageId: 4 },
      { name: 'Continuous Compliance Monitoring', description: 'Real-time monitoring and assessment of device compliance with security policies and standards. Optimal process providing continuous security posture visibility and automated remediation.', type: 'Process', maturityStageId: 4 },
      { name: 'AI-Driven Governance Insights', description: 'Machine learning-powered governance platform providing predictive insights and automated policy recommendations. Optimal technology offering intelligent governance with proactive risk mitigation.', type: 'Process', maturityStageId: 4 }
    ],

    // Devices Pillar - Policy Enforcement & Compliance Monitoring Function
    'Policy Enforcement & Compliance Monitoring': [
      // Traditional (1)
      { name: 'Basic Group Policy Management', description: 'Windows Group Policy providing centralized device configuration and security settings. Traditional technology establishing the foundation for device management before transitioning to modern cloud-based device management solutions.', type: 'Technology', maturityStageId: 1 },
      { name: 'Manual Device Configuration', description: 'Individual device setup and configuration performed manually by IT staff. Traditional approach providing basic device standardization before implementing automated deployment and configuration management systems.', type: 'Technology', maturityStageId: 1 },
      { name: 'Manual Compliance Checking', description: 'Manual auditing processes to verify device compliance with security policies and standards. Traditional process establishing compliance discipline before implementing automated monitoring and enforcement capabilities.', type: 'Process', maturityStageId: 1 },
      { name: 'Basic Device Inventory Management', description: 'Manual tracking and documentation of organizational devices and their configurations. Traditional process providing device visibility before implementing automated asset discovery and management systems.', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { name: 'Azure AD Device Registration', description: 'Cloud-based device identity and registration service enabling device-based access controls. Initial technology bridging traditional AD with cloud identity for hybrid device management scenarios.', type: 'Technology', maturityStageId: 2 },
      { name: 'Basic Mobile Device Management', description: 'Fundamental mobile device control and policy enforcement for smartphones and tablets. Initial technology extending device management beyond traditional desktops to mobile endpoints.', type: 'Technology', maturityStageId: 2 },
      { name: 'Device Compliance Policy Framework', description: 'Structured policies defining security requirements and standards for organizational devices. Initial process establishing consistent device security baselines before implementing automated enforcement.', type: 'Process', maturityStageId: 2 },
      { name: 'Standard Device Configuration Process', description: 'Standardized procedures for consistent device setup and security configuration across the organization. Initial process improving device security posture through consistent deployment practices.', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { name: 'Microsoft Intune Device Compliance', description: 'Cloud-based mobile device management with automated compliance monitoring and enforcement. Advanced technology providing comprehensive device management with policy-driven security controls.', type: 'Technology', maturityStageId: 3 },
      { name: 'Automated Policy Deployment', description: 'Automated distribution and enforcement of security policies across managed devices. Advanced technology ensuring consistent security configuration without manual intervention.', type: 'Technology', maturityStageId: 3 },
      { name: 'Mobile Device Management Workflow', description: 'Comprehensive processes for managing mobile devices throughout their lifecycle from enrollment to retirement. Advanced process ensuring secure mobile device integration with enterprise systems.', type: 'Process', maturityStageId: 3 },
      { name: 'Device Security Baseline Implementation', description: 'Systematic deployment of security baselines and hardening configurations across all devices. Advanced process ensuring consistent security posture based on industry standards and best practices.', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { name: 'Microsoft Defender for Endpoint', description: 'Endpoint detection and response platform with AI-powered threat protection and automated remediation. Comprehensive technology providing complete endpoint security with behavioral analysis and automated response.', type: 'Technology', maturityStageId: 4 },
      { name: 'Zero-Touch Device Enrollment', description: 'Automated device provisioning and configuration without manual IT intervention. Optimal technology enabling seamless device deployment with security controls built into the process.', type: 'Technology', maturityStageId: 4 },
      { name: 'Continuous Compliance Monitoring', description: 'Real-time monitoring and assessment of device compliance with security policies and standards. Optimal process providing continuous security posture visibility and automated remediation.', type: 'Process', maturityStageId: 4 },
      { name: 'AI-Driven Device Risk Assessment', description: 'Machine learning-based analysis of device behavior and risk indicators for proactive threat detection. Optimal process providing predictive device security with automated risk mitigation.', type: 'Process', maturityStageId: 4 }
    ],

    // Devices Pillar - Asset & Supply Chain Risk Management Function
    'Asset & Supply Chain Risk Management': [
      // Traditional (1)
      { name: 'Manual Asset Inventory Spreadsheets', description: 'Basic spreadsheet tracking of hardware assets, locations, and ownership information. Traditional technology providing foundational asset visibility before implementing automated discovery and management systems.', type: 'Technology', maturityStageId: 1 },
      { name: 'Basic Asset Tracking Systems', description: 'Simple database systems for recording and managing organizational hardware assets. Traditional technology establishing asset accountability before implementing comprehensive lifecycle management.', type: 'Technology', maturityStageId: 1 },
      { name: 'Annual Hardware Audits', description: 'Periodic manual verification of asset inventory, condition, and compliance status. Traditional process establishing asset governance discipline before implementing continuous monitoring capabilities.', type: 'Process', maturityStageId: 1 },
      { name: 'Manual Procurement Approval', description: 'Paper-based or email approval processes for new hardware purchases and vendor selection. Traditional process providing basic procurement oversight before implementing automated workflows and risk assessment.', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { name: 'Microsoft Intune Asset Inventory', description: 'Cloud-based automated discovery and inventory of managed devices and their configurations. Initial technology providing real-time asset visibility and basic lifecycle management.', type: 'Technology', maturityStageId: 2 },
      { name: 'Centralized Asset Database', description: 'Unified system for tracking all organizational assets with enhanced search and reporting capabilities. Initial technology improving asset management efficiency and accuracy.', type: 'Technology', maturityStageId: 2 },
      { name: 'Hardware Asset Lifecycle Management', description: 'Structured processes for managing assets from procurement through disposal with security considerations. Initial process ensuring proper asset governance and risk management throughout the asset lifecycle.', type: 'Process', maturityStageId: 2 },
      { name: 'Basic Supply Chain Security Standards', description: 'Security requirements and validation procedures for technology vendors and suppliers. Foundational process establishing supply chain risk awareness before implementing comprehensive threat assessment.', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { name: 'Microsoft Defender Vulnerability Management', description: 'Vulnerability assessment and management platform for hardware and firmware components. Comprehensive technology providing complete visibility into device-level security risks and automated remediation guidance.', type: 'Technology', maturityStageId: 3 },
      { name: 'Azure Resource Graph for Asset Tracking', description: 'Cloud-based query engine for comprehensive asset discovery and relationship mapping across Azure resources. Powerful technology providing deep visibility into asset dependencies and configuration relationships.', type: 'Technology', maturityStageId: 3 },
      { name: 'Supply Chain Risk Assessment Process', description: 'Comprehensive evaluation of vendor security practices, geopolitical risks, and supply chain threats. Advanced process ensuring third-party risk management and resilient supply chain security.', type: 'Process', maturityStageId: 3 },
      { name: 'Device Security Certification Process', description: 'Formal validation and approval processes for new device types and models before deployment. Advanced process ensuring only secure, approved devices enter the organization.', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { name: 'AI-Powered Asset Discovery', description: 'Machine learning-based automatic discovery and classification of network-connected assets and devices. Optimal technology providing comprehensive asset visibility including shadow IT and IoT devices.', type: 'Technology', maturityStageId: 4 },
      { name: 'Supply Chain Intelligence Platform', description: 'Threat intelligence and risk monitoring platform for suppliers, vendors, and supply chain components. Intelligence technology providing real-time supply chain risk assessment and threat detection.', type: 'Technology', maturityStageId: 4 },
      { name: 'Automated Supply Chain Risk Monitoring', description: 'Continuous monitoring of supplier security posture, incidents, and geopolitical risk factors. Optimal process providing proactive supply chain risk management with automated alerting and response.', type: 'Process', maturityStageId: 4 },
      { name: 'Predictive Asset Lifecycle Management', description: 'AI-driven forecasting of asset needs, lifecycle stages, and optimal replacement timing. Optimal process providing strategic asset planning with predictive maintenance and security considerations.', type: 'Process', maturityStageId: 4 }
    ],

    // Devices Pillar - Resource Access Function
    'Resource Access': [
      // Traditional (1)
      { name: 'Device-Based Group Membership', description: 'Basic device categorization and group assignment for applying common access policies. Traditional technology providing device-based access control before implementing dynamic, risk-based access decisions.', type: 'Technology', maturityStageId: 1 },
      { name: 'Manual Device Authentication', description: 'Basic device identification and verification processes using static credentials or certificates. Traditional technology establishing device identity before implementing advanced device trust and continuous verification.', type: 'Technology', maturityStageId: 1 },
      { name: 'Basic Device Access Controls', description: 'Simple permit/deny access rules based on device type, location, or static attributes. Traditional process providing fundamental device access governance before implementing adaptive and contextual controls.', type: 'Process', maturityStageId: 1 },
      { name: 'Manual Device Trust Assessment', description: 'Manual evaluation of device security posture and trustworthiness before granting access. Traditional process establishing device trust concepts before implementing automated trust scoring and continuous assessment.', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { name: 'Certificate-Based Device Authentication', description: 'PKI-based device identity using digital certificates for authentication to enterprise resources. Initial technology improving device authentication security and enabling device-based access policies.', type: 'Technology', maturityStageId: 2 },
      { name: 'Basic Device Trust Policies', description: 'Foundational policies defining device requirements and trust levels for accessing different resources. Initial technology establishing device trust framework before implementing dynamic trust evaluation.', type: 'Technology', maturityStageId: 2 },
      { name: 'Device-Based Access Control Framework', description: 'Structured approach to managing resource access based on device identity, compliance, and security posture. Initial process providing systematic device access governance with policy-driven controls.', type: 'Process', maturityStageId: 2 },
      { name: 'Standard Device Onboarding Process', description: 'Formal procedures for enrolling devices into management and granting appropriate access privileges. Initial process ensuring secure device integration with consistent security validation.', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { name: 'Azure AD Device-Based Conditional Access', description: 'Cloud-based dynamic access controls considering device compliance, location, and risk factors. Advanced technology providing sophisticated device access decisions based on real-time security posture.', type: 'Technology', maturityStageId: 3 },
      { name: 'Microsoft Intune App Protection Policies', description: 'Application-level security controls protecting corporate data on managed and unmanaged devices. Advanced technology providing granular data protection regardless of device ownership or management status.', type: 'Technology', maturityStageId: 3 },
      { name: 'Trusted Device Certification Process', description: 'Formal validation and approval processes establishing device trust levels for accessing sensitive resources. Advanced process ensuring only secure, compliant devices can access critical organizational assets.', type: 'Process', maturityStageId: 3 },
      { name: 'Remote Access Security Procedures', description: 'Comprehensive security protocols for devices accessing resources from external networks. Advanced process ensuring secure remote connectivity with appropriate security controls and monitoring.', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { name: 'Windows Hello for Business', description: 'Biometric and PIN-based authentication eliminating passwords for device and resource access. Optimal technology providing strong, user-friendly authentication with hardware-backed security.', type: 'Technology', maturityStageId: 4 },
      { name: 'Zero Trust Device Verification', description: 'Continuous verification of device identity, compliance, and security posture for every access request. Optimal technology implementing never-trust, always-verify principles for device access.', type: 'Technology', maturityStageId: 4 },
      { name: 'Continuous Device Trust Evaluation', description: 'Real-time assessment of device trustworthiness based on behavior, compliance, and threat intelligence. Optimal process providing dynamic device trust scoring with automated access adjustments.', type: 'Process', maturityStageId: 4 },
      { name: 'Adaptive Device Access Controls', description: 'AI-driven access controls that dynamically adjust permissions based on device risk, context, and behavioral patterns. Optimal process providing intelligent access management that adapts to changing security conditions.', type: 'Process', maturityStageId: 4 }
    ],

    // Devices Pillar - Device Threat Protection Function
    'Device Threat Protection': [
      // Traditional (1)
      { name: 'Basic Antivirus Software', description: 'Signature-based antivirus providing protection against known malware threats. Traditional technology establishing the foundation for endpoint protection before implementing advanced behavioral analysis and cloud-based threat detection.', type: 'Technology', maturityStageId: 1 },
      { name: 'Manual Malware Scanning', description: 'Manual scanning tools for detecting and removing malicious software. Traditional technology providing basic threat remediation capabilities before implementing automated and continuous monitoring solutions.', type: 'Technology', maturityStageId: 1 },
      { name: 'Basic Incident Response Procedures', description: 'Manual procedures for responding to security incidents on devices. Traditional process establishing incident management discipline before implementing automated response and threat hunting capabilities.', type: 'Process', maturityStageId: 1 },
      { name: 'Manual Threat Investigation', description: 'Manual analysis and investigation of security threats and suspicious activities. Traditional process providing the foundation for threat analysis before implementing automated forensics and threat intelligence.', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { name: 'Microsoft Defender SmartScreen', description: 'Cloud-based reputation checking for web content and downloads. Initial technology that enhances traditional antivirus with cloud intelligence and real-time threat assessment capabilities.', type: 'Technology', maturityStageId: 2 },
      { name: 'Windows Security Center', description: 'Centralized security status monitoring and management for Windows devices. Initial technology providing unified visibility and management of security components before advanced endpoint management platforms.', type: 'Technology', maturityStageId: 2 },
      { name: 'Centralized Threat Monitoring', description: 'Coordinated monitoring of threats across the device fleet. Initial process that centralizes threat visibility and enables better threat correlation before implementing advanced analytics.', type: 'Process', maturityStageId: 2 },
      { name: 'Standardized Incident Response', description: 'Consistent procedures for incident response across all devices. Initial process that brings structure and repeatability to incident management before implementing automated response workflows.', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { name: 'Microsoft Defender for Business', description: 'Enterprise-grade endpoint detection and response with advanced threat protection. Advanced technology providing sophisticated threat hunting and behavioral analysis capabilities for comprehensive endpoint security.', type: 'Technology', maturityStageId: 3 },
      { name: 'Advanced Threat Protection', description: 'Multi-layered protection combining behavioral analysis, machine learning, and threat intelligence. Advanced technology offering proactive threat detection and prevention beyond traditional signature-based approaches.', type: 'Technology', maturityStageId: 3 },
      { name: 'Endpoint Detection and Response Process', description: 'Comprehensive procedures for detecting, investigating, and responding to endpoint threats. Advanced process enabling detailed forensics and rapid threat containment across the device infrastructure.', type: 'Process', maturityStageId: 3 },
      { name: 'Malware Response and Remediation Workflow', description: 'Sophisticated workflows for malware analysis and remediation. Advanced process providing systematic approach to threat elimination and recovery while preventing reinfection.', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { name: 'AI-Powered Behavioral Analysis', description: 'Machine learning-based analysis of device and user behavior to detect advanced threats. Optimal technology providing predictive threat detection and zero-day protection through behavioral modeling.', type: 'Technology', maturityStageId: 4 },
      { name: 'Zero-Day Threat Protection', description: 'Protection platform against unknown and emerging threats using AI sandboxing and behavioral analysis. Cutting-edge technology offering the highest level of protection against sophisticated and novel attack techniques.', type: 'Technology', maturityStageId: 4 },
      { name: 'Device Threat Intelligence Integration', description: 'Integration of global threat intelligence feeds with device protection systems. Optimal process providing real-time threat intelligence correlation and adaptive protection based on emerging threats.', type: 'Process', maturityStageId: 4 },
      { name: 'Automated Threat Response and Containment', description: 'AI-driven automatic response to threats with intelligent containment and remediation. Optimal process providing immediate threat neutralization without human intervention while preserving business operations.', type: 'Process', maturityStageId: 4 }
    ],

    // Networks Pillar - Network Segmentation Function
    'Network Segmentation': [
      // Traditional (1)
      { name: 'Basic VLANs', description: 'Simple Virtual Local Area Networks providing basic network isolation at the data link layer. Traditional technology establishing the foundation for network segmentation before implementing advanced software-defined networking.', type: 'Technology', maturityStageId: 1 },
      { name: 'Physical Network Separation', description: 'Physical isolation of networks using separate hardware and infrastructure. Traditional approach providing the strongest isolation but with limited flexibility before software-defined alternatives.', type: 'Technology', maturityStageId: 1 },
      { name: 'Manual Network Configuration', description: 'Human-performed setup and configuration of network devices and services. Traditional technology requiring manual administration before implementing infrastructure as code and automated network management.', type: 'Process', maturityStageId: 1 },
      { name: 'Basic Network Documentation', description: 'Simple documentation of network topology and segmentation rules. Traditional process providing the foundation for network governance before implementing automated discovery and mapping.', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { name: 'Azure Virtual Network', description: 'Cloud-based virtual networking with built-in isolation and security features. Initial technology enabling cloud network segmentation and providing the foundation for hybrid network architectures.', type: 'Technology', maturityStageId: 2 },
      { name: 'Subnet-Based Segmentation', description: 'Network segmentation using subnet boundaries and routing controls. Initial technology that improves upon basic VLANs with more granular control and better integration with cloud services.', type: 'Technology', maturityStageId: 2 },
      { name: 'Network Access Control Policy Framework', description: 'Structured policies governing network access and segmentation decisions. Initial process that brings consistency and governance to network security before implementing automated enforcement.', type: 'Process', maturityStageId: 2 },
      { name: 'Network Topology Planning Process', description: 'Systematic planning of network architecture and segmentation strategy. Initial process that ensures purposeful network design before implementing dynamic and adaptive segmentation.', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { name: 'Azure Network Security Groups', description: 'Stateful firewall rules providing granular network access control within Azure. Advanced technology offering sophisticated traffic filtering and micro-segmentation capabilities in cloud environments.', type: 'Technology', maturityStageId: 3 },
      { name: 'Azure Firewall', description: 'Managed cloud firewall with advanced threat intelligence and application-level filtering. Advanced technology providing enterprise-grade network protection with centralized management and logging.', type: 'Technology', maturityStageId: 3 },
      { name: 'Network Micro-Segmentation Strategy', description: 'Fine-grained segmentation strategy isolating individual workloads and applications. Advanced process enabling zero-trust network principles and limiting lateral movement of threats.', type: 'Process', maturityStageId: 3 },
      { name: 'Dynamic Network Isolation Procedures', description: 'Automated procedures for isolating compromised or suspicious network segments. Advanced process providing rapid threat containment and reducing the impact of security incidents.', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { name: 'Software-Defined Perimeter (SDP)', description: 'Dynamic, encrypted micro-tunnels providing application-specific network access. Optimal technology eliminating network-based attacks through cryptographically-secured, individualized network perimeters.', type: 'Technology', maturityStageId: 4 },
      { name: 'AI-Driven Network Segmentation', description: 'Machine learning-powered automatic network segmentation based on traffic patterns and risk analysis. Optimal technology providing intelligent, adaptive segmentation that responds to changing threats and business needs.', type: 'Technology', maturityStageId: 4 },
      { name: 'Zero Trust Network Architecture Implementation', description: 'Comprehensive implementation of never-trust, always-verify network principles. Optimal process eliminating implicit trust and requiring verification for every network transaction and connection.', type: 'Process', maturityStageId: 4 },
      { name: 'Adaptive Network Segmentation Process', description: 'Dynamic network segmentation that automatically adjusts based on threat intelligence and behavioral analysis. Optimal process providing intelligent network defense that evolves with the threat landscape.', type: 'Process', maturityStageId: 4 }
    ],

    // Networks Pillar - Network Traffic Management Function
    'Network Traffic Management': [
      // Traditional (1)
      { name: 'Hardware Load Balancers', description: 'Physical appliances for distributing network traffic across multiple servers. Traditional technology providing basic load distribution and availability before implementing cloud-based and intelligent traffic management.', type: 'Technology', maturityStageId: 1 },
      { name: 'Basic Network Monitoring Tools', description: 'Simple monitoring systems for tracking network performance and basic health metrics. Traditional technology providing fundamental visibility before implementing advanced analytics and AI-powered monitoring.', type: 'Technology', maturityStageId: 1 },
      { name: 'Manual Traffic Analysis', description: 'Manual examination of network traffic patterns and performance metrics. Traditional process providing basic network optimization before implementing automated analysis and predictive management.', type: 'Process', maturityStageId: 1 },
      { name: 'Reactive Bandwidth Management', description: 'Manual response to bandwidth issues after they occur. Traditional process establishing network management discipline before implementing proactive and predictive traffic management.', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { name: 'Azure Load Balancer', description: 'Cloud-based load balancing service with high availability and scalability. Initial technology providing enhanced traffic distribution with cloud integration and better resilience than hardware solutions.', type: 'Technology', maturityStageId: 2 },
      { name: 'Basic Quality of Service (QoS)', description: 'Network traffic prioritization and bandwidth allocation mechanisms. Initial technology ensuring critical applications receive adequate network resources before implementing advanced traffic optimization.', type: 'Technology', maturityStageId: 2 },
      { name: 'Network Traffic Analysis and Monitoring', description: 'Systematic analysis of network traffic patterns and performance trends. Initial process providing structured approach to network optimization before implementing automated and predictive management.', type: 'Process', maturityStageId: 2 },
      { name: 'Capacity Planning Process', description: 'Structured planning for network capacity requirements and growth. Initial process ensuring adequate network resources before implementing dynamic and adaptive capacity management.', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { name: 'Azure Traffic Manager', description: 'DNS-based traffic routing service with health monitoring and automatic failover. Advanced technology providing intelligent traffic distribution across global endpoints with sophisticated routing policies.', type: 'Technology', maturityStageId: 3 },
      { name: 'Azure Application Gateway', description: 'Layer 7 load balancer with web application firewall and SSL termination. Advanced technology offering application-aware traffic management with integrated security and performance optimization.', type: 'Technology', maturityStageId: 3 },
      { name: 'Bandwidth Management and QoS Procedures', description: 'Network procedures for optimizing bandwidth utilization and traffic prioritization with policy enforcement. Traffic engineering process ensuring optimal network performance through sophisticated traffic management and SLA enforcement.', type: 'Process', maturityStageId: 3 },
      { name: 'DDoS Protection Response Plan', description: 'Comprehensive procedures for detecting and mitigating distributed denial of service attacks. Advanced process providing coordinated response to network-based attacks and ensuring service continuity.', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { name: 'AI-Powered Traffic Optimization', description: 'Machine learning-based optimization of network traffic patterns and routing decisions. Optimal technology providing intelligent traffic management that continuously learns and adapts to optimize performance.', type: 'Technology', maturityStageId: 4 },
      { name: 'Intelligent Load Balancing', description: 'AI-driven load balancing that considers application performance, user experience, and real-time conditions. Optimal technology providing the most sophisticated traffic distribution with predictive optimization.', type: 'Technology', maturityStageId: 4 },
      { name: 'Predictive Traffic Management', description: 'AI-powered prediction of traffic patterns and proactive optimization of network resources. Optimal process anticipating network needs and automatically adjusting configuration to prevent performance issues.', type: 'Process', maturityStageId: 4 },
      { name: 'Automated Performance Optimization', description: 'Intelligent automation that continuously optimizes network performance based on real-time analysis. Optimal process providing self-healing networks that maintain optimal performance without human intervention.', type: 'Process', maturityStageId: 4 }
    ],

    // Networks Pillar - Traffic Encryption Function
    'Traffic Encryption': [
      // Traditional (1)
      { name: 'Basic SSL/TLS', description: 'Standard SSL/TLS encryption for web traffic and basic communications. Traditional technology providing fundamental encryption capabilities before implementing advanced cryptographic protocols and automated certificate management.', type: 'Technology', maturityStageId: 1 },
      { name: 'Manual Certificate Management', description: 'Manual processes for obtaining, installing, and renewing digital certificates. Traditional approach establishing encryption discipline before implementing automated certificate lifecycle management systems.', type: 'Technology', maturityStageId: 1 },
      { name: 'Basic Encryption Standards', description: 'Implementation of standard encryption algorithms and protocols for data protection. Traditional process ensuring minimum encryption requirements before implementing advanced cryptographic strategies.', type: 'Process', maturityStageId: 1 },
      { name: 'Manual Certificate Renewal Process', description: 'Manual procedures for tracking and renewing expiring certificates. Traditional process preventing certificate-related outages before implementing automated renewal and monitoring systems.', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { name: 'Azure VPN Gateway', description: 'Managed VPN service providing encrypted connectivity between networks. Initial technology enabling secure remote access and site-to-site connectivity with cloud integration and simplified management.', type: 'Technology', maturityStageId: 2 },
      { name: 'Centralized Certificate Management', description: 'Centralized systems for managing digital certificates across the organization. Initial technology improving certificate visibility and control before implementing advanced certificate automation and governance.', type: 'Technology', maturityStageId: 2 },
      { name: 'Certificate Lifecycle Management Workflow', description: 'Structured workflows for managing the complete certificate lifecycle from request to revocation. Initial process ensuring certificate governance and reducing security risks from expired certificates.', type: 'Process', maturityStageId: 2 },
      { name: 'Encryption Policy Framework', description: 'Comprehensive policies defining encryption requirements and standards across the organization. Initial process establishing encryption governance before implementing automated policy enforcement.', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { name: 'Azure ExpressRoute', description: 'Private network connection to Azure with optional encryption and guaranteed bandwidth. Advanced technology providing high-performance, secure connectivity with enterprise-grade reliability and control.', type: 'Technology', maturityStageId: 3 },
      { name: 'TLS/SSL Certificate Management via Azure Key Vault', description: 'Cloud-based certificate management with automated provisioning and renewal. Advanced technology providing secure certificate storage with integrated automation and compliance monitoring.', type: 'Technology', maturityStageId: 3 },
      { name: 'End-to-End Encryption Implementation Process', description: 'Comprehensive procedures for implementing encryption throughout the entire data flow. Advanced process ensuring complete data protection from source to destination with no unencrypted exposure.', type: 'Process', maturityStageId: 3 },
      { name: 'Network Encryption Standards and Compliance', description: 'Encryption standards implementation with compliance monitoring and enforcement across network infrastructure. Compliance process ensuring encryption meets regulatory requirements and industry best practices consistently.', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { name: 'Post-Quantum Cryptography', description: 'Quantum-resistant encryption algorithms protecting against future quantum computing threats. Optimal technology providing future-proof encryption that maintains security even against quantum computer attacks.', type: 'Technology', maturityStageId: 4 },
      { name: 'Zero-Trust Network Encryption', description: 'Comprehensive encryption implementation following zero-trust principles with no implicit trust. Optimal technology ensuring all network communications are encrypted regardless of location or assumed security level.', type: 'Technology', maturityStageId: 4 },
      { name: 'Adaptive Encryption Management', description: 'Intelligent encryption management that adapts protocols and strength based on risk assessment. Optimal process providing dynamic encryption that balances security requirements with performance and compatibility needs.', type: 'Process', maturityStageId: 4 },
      { name: 'Continuous Cryptographic Assessment', description: 'Ongoing evaluation and optimization of cryptographic implementations and protocols. Optimal process ensuring encryption remains effective against evolving threats and maintains optimal performance.', type: 'Process', maturityStageId: 4 }
    ],

    // Networks Pillar - Network Resilience Function
    'Network Resilience': [
      // Traditional (1)
      { name: 'Basic Network Redundancy', description: 'Fundamental network backup paths and duplicate components to prevent single points of failure. Traditional technology providing basic availability before implementing advanced failover and load balancing systems.', type: 'Technology', maturityStageId: 1 },
      { name: 'Manual Failover Systems', description: 'Human-operated backup system activation when primary systems fail. Traditional technology requiring manual intervention before implementing automated failover and recovery systems.', type: 'Technology', maturityStageId: 1 },
      { name: 'Basic Disaster Recovery Planning', description: 'Fundamental disaster recovery planning establishing baseline recovery procedures and documentation. Foundational procedures that establish baseline capabilities before implementing automated recovery solutions.', type: 'Process', maturityStageId: 1 },
      { name: 'Manual Network Recovery Procedures', description: 'Human-operated network recovery procedures for restoring connectivity after failures or disasters. Foundational procedures that establish baseline capabilities before implementing automated recovery solutions.', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { name: 'Azure Backup', description: 'Cloud-based backup service providing automated data protection with centralized management. Initial technology improving backup reliability and reducing infrastructure overhead compared to traditional backup systems.', type: 'Technology', maturityStageId: 2 },
      { name: 'Basic High Availability Configuration', description: 'Redundancy and failover configurations to improve system uptime and service availability. Foundational technology providing improved resilience before implementing geo-redundancy and automated failover.', type: 'Technology', maturityStageId: 2 },
      { name: 'Network Disaster Recovery Planning', description: 'Structured disaster recovery planning specifically focused on network infrastructure and connectivity. Systematic process introducing structured procedures and governance to improve upon manual approaches.', type: 'Process', maturityStageId: 2 },
      { name: 'Structured Recovery Procedures', description: 'Systematic recovery procedures with defined steps, roles, and responsibilities for incident response. Organized process introducing structured procedures and governance to improve upon manual approaches.', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { name: 'Azure Site Recovery', description: 'Cloud-based disaster recovery service with automated failover and recovery orchestration capabilities. Enterprise technology offering sophisticated capabilities with enhanced automation and integration for business continuity.', type: 'Technology', maturityStageId: 3 },
      { name: 'Multi-Zone Deployment', description: 'Application and infrastructure deployment across multiple availability zones for high availability. Resilience technology offering sophisticated capabilities with enhanced fault tolerance and geographic distribution.', type: 'Technology', maturityStageId: 3 },
      { name: 'Business Continuity Testing Procedures', description: 'Systematic testing procedures for validating disaster recovery and business continuity capabilities. Validation process providing sophisticated procedures with automation and comprehensive testing coverage.', type: 'Process', maturityStageId: 3 },
      { name: 'Network Redundancy Implementation Process', description: 'Systematic implementation of network redundancy with automated failover and load balancing. Infrastructure process providing sophisticated procedures with automation and enhanced reliability capabilities.', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { name: 'Azure Multi-Region Deployment', description: 'Cross-regional application deployment with automated failover and data replication capabilities. Global technology representing cutting-edge infrastructure with AI-powered features and comprehensive geographic protection.', type: 'Technology', maturityStageId: 4 },
      { name: 'AI-Driven Resilience Management', description: 'Artificial intelligence-powered resilience management with predictive failure detection and automated recovery. Intelligent technology representing cutting-edge infrastructure with AI-powered features and comprehensive protection capabilities.', type: 'Technology', maturityStageId: 4 },
      { name: 'Automated Disaster Recovery', description: 'Intelligent disaster recovery systems with automated failover, testing, and recovery procedures. Advanced technology providing business continuity assurance with minimal manual intervention.', type: 'Process', maturityStageId: 4 },
      { name: 'Self-Healing Network Architecture', description: 'Autonomous network architecture that automatically detects and resolves issues without human intervention. Intelligent process representing the pinnacle of network automation with AI-driven self-repair and predictive capabilities.', type: 'Process', maturityStageId: 4 }
    ],

    // Applications & Workloads Pillar - Application Access Function
    'Application Access': [
      // Traditional (1)
      { name: 'Basic Authentication Systems', description: 'Simple username/password systems for network device and service access. Traditional technology providing basic access control before implementing advanced authentication and zero-trust network principles.', type: 'Technology', maturityStageId: 1 },
      { name: 'Manual Access Control Lists', description: 'Manual configuration of data access permissions and restrictions. Traditional technology requiring manual administration before implementing automated access governance and policy-driven controls.', type: 'Technology', maturityStageId: 1 },
      { name: 'Manual Application Access Management', description: 'Human-administered application access control with manual provisioning and deprovisioning procedures. Foundational procedures that establish baseline capabilities before implementing automated access management solutions.', type: 'Process', maturityStageId: 1 },
      { name: 'Basic User Provisioning Process', description: 'Fundamental user account creation and access provisioning procedures with manual approval workflows. Foundational procedures that establish baseline capabilities before implementing automated provisioning solutions.', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { name: 'Single Sign-On (SSO) Solutions', description: 'Centralized authentication reducing password complexity and improving user experience across network services. Initial technology simplifying access management while improving security posture.', type: 'Technology', maturityStageId: 2 },
      { name: 'Basic API Management', description: 'API security and management platform including authentication, rate limiting, and basic monitoring. Foundational technology providing API governance before implementing enterprise-grade security and analytics.', type: 'Technology', maturityStageId: 2 },
      { name: 'Application Access Review Process', description: 'Systematic application access review procedures with approval workflows and documentation. Structured process introducing systematic procedures and governance to improve upon manual approaches.', type: 'Process', maturityStageId: 2 },
      { name: 'Standard User Onboarding Workflow', description: 'Standardized user onboarding procedures with consistent access provisioning and training requirements. Systematic process introducing structured procedures and governance to improve upon manual approaches.', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { name: 'Azure AD Application Proxy', description: 'Cloud-based application proxy providing secure remote access to on-premises applications without VPN. Enterprise technology offering sophisticated capabilities with enhanced security features and seamless integration.', type: 'Technology', maturityStageId: 3 },
      { name: 'Azure API Management', description: 'Enterprise API management platform with security, analytics, and developer portal capabilities. Full-featured technology offering sophisticated capabilities with enhanced security features and comprehensive API lifecycle management.', type: 'Technology', maturityStageId: 3 },
      { name: 'API Security Gateway Implementation', description: 'Implementation procedures for API security gateways with authentication, authorization, and threat protection. Security process providing sophisticated procedures with automation and enhanced protection capabilities.', type: 'Process', maturityStageId: 3 },
      { name: 'Single Sign-On Deployment Workflow', description: 'Deployment procedures for enterprise single sign-on with application integration and user training. Implementation process providing sophisticated procedures with automation and enhanced user experience capabilities.', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { name: 'Microsoft Entra Application Governance', description: 'Application governance platform with policy management, compliance monitoring, and risk assessment. Comprehensive technology representing cutting-edge application security with AI-powered features and complete governance capabilities.', type: 'Technology', maturityStageId: 4 },
      { name: 'Zero Trust Application Access', description: 'Never-trust always-verify application access model with continuous verification and risk assessment. Security model representing cutting-edge application protection with AI-powered features and comprehensive access validation.', type: 'Technology', maturityStageId: 4 },
      { name: 'Adaptive Application Access Controls', description: 'AI-driven application access controls that dynamically adjust permissions based on user behavior and risk context. Intelligent process providing adaptive security that evolves with user patterns and threat landscapes.', type: 'Process', maturityStageId: 4 },
      { name: 'AI-Driven Access Optimization', description: 'Machine learning-powered access optimization providing intelligent permission management and user experience enhancement. Intelligent process providing automated access management with continuous improvement and predictive capabilities.', type: 'Process', maturityStageId: 4 }
    ],

    // Applications & Workloads Pillar - Application Threat Protections Function
    'Application Threat Protections': [
      // Traditional (1)
      { name: 'Basic Antivirus for Applications', description: 'Signature-based malware detection for application servers and runtime environments with basic threat protection. Foundational technology providing essential threat protection before implementing behavioral analysis and cloud-based threat detection.', type: 'Technology', maturityStageId: 1 },
      { name: 'Manual Security Scanning', description: 'Human-performed security assessment and vulnerability scanning of applications and infrastructure. Traditional technology providing manual security validation before implementing automated scanning and continuous security monitoring.', type: 'Technology', maturityStageId: 1 },
      { name: 'Basic Incident Response for Apps', description: 'Fundamental incident response procedures specifically designed for application security events and breaches. Foundational procedures that establish baseline capabilities before implementing automated incident response solutions.', type: 'Process', maturityStageId: 1 },
      { name: 'Manual Threat Assessment', description: 'Human-performed threat assessment and risk analysis for applications and infrastructure components. Foundational procedures that establish baseline capabilities before implementing automated threat analysis solutions.', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { name: 'Web Application Firewalls', description: 'HTTP/HTTPS traffic filtering and protection against common web application attacks. Initial technology providing application-layer security before implementing advanced threat detection and response.', type: 'Technology', maturityStageId: 2 },
      { name: 'Basic Application Monitoring', description: 'Simple application performance and health monitoring with basic alerting capabilities. Initial technology providing application visibility before implementing comprehensive observability and analytics.', type: 'Technology', maturityStageId: 2 },
      { name: 'Application Security Monitoring Process', description: 'Systematic application security monitoring procedures with structured alerting and response workflows. Structured process introducing systematic procedures and governance to improve upon manual approaches.', type: 'Process', maturityStageId: 2 },
      { name: 'Standard Vulnerability Management', description: 'Standardized vulnerability management procedures with consistent scanning, assessment, and remediation workflows. Systematic process introducing structured procedures and governance to improve upon manual approaches.', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { name: 'Azure Web Application Firewall', description: 'Cloud-based web application firewall providing protection against OWASP Top 10 attacks and custom rules. Enterprise technology offering sophisticated capabilities with enhanced security features and seamless Azure integration.', type: 'Technology', maturityStageId: 3 },
      { name: 'Azure DDoS Protection', description: 'Cloud-based distributed denial of service protection with automatic attack mitigation and analytics. Enterprise technology offering sophisticated capabilities with enhanced security features and real-time protection.', type: 'Technology', maturityStageId: 3 },
      { name: 'Application Security Threat Modeling', description: 'Systematic threat modeling procedures for applications with automated analysis and risk assessment. Security engineering process providing sophisticated procedures with automation and enhanced threat identification capabilities.', type: 'Process', maturityStageId: 3 },
      { name: 'Security Incident Response for Applications', description: 'Comprehensive incident response procedures specifically designed for application security events with automation. Response process providing sophisticated procedures with automation and enhanced security capabilities.', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { name: 'Microsoft Defender for Cloud Apps', description: 'Cloud application security broker providing advanced threat protection, data loss prevention, and compliance for SaaS applications. Advanced technology offering comprehensive cloud application security.', type: 'Technology', maturityStageId: 4 },
      { name: 'AI-Powered Application Protection', description: 'Machine learning-based application protection with behavioral analysis and automated threat response. Cutting-edge technology representing next-generation application security with AI-powered features and comprehensive protection capabilities.', type: 'Technology', maturityStageId: 4 },
      { name: 'Runtime Application Self-Protection Implementation', description: 'Implementation of runtime application self-protection with real-time threat detection and automatic response. Security process representing the pinnacle of application security with AI-driven automation and predictive capabilities.', type: 'Process', maturityStageId: 4 },
      { name: 'Autonomous Threat Response', description: 'Fully automated threat response system with AI-driven decision making and remediation capabilities. Security process representing the pinnacle of threat management with AI-driven automation and predictive capabilities.', type: 'Process', maturityStageId: 4 }
    ],

    // Applications & Workloads Pillar - Accessible Applications Function
    'Accessible Applications': [
      // Traditional (1)
      { name: 'Basic Web Servers', description: 'Simple HTTP servers for hosting web applications with basic configuration. Traditional technology providing fundamental web hosting before implementing cloud-native platforms and container orchestration.', type: 'Technology', maturityStageId: 1 },
      { name: 'Static File Hosting', description: 'Basic file serving for websites and applications with minimal dynamic functionality. Traditional technology providing simple content delivery before implementing CDNs and dynamic application platforms.', type: 'Technology', maturityStageId: 1 },
      { name: 'Manual Application Deployment', description: 'Human-performed deployment of applications to servers and infrastructure. Traditional technology requiring manual processes before implementing automated deployment pipelines and container orchestration.', type: 'Process', maturityStageId: 1 },
      { name: 'Basic Accessibility Compliance', description: 'Fundamental accessibility compliance procedures ensuring applications meet basic disability access requirements. Foundational procedures that establish baseline capabilities before implementing automated accessibility testing solutions.', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { name: 'Azure App Service', description: 'Platform-as-a-Service for hosting web applications with integrated development tools. Initial technology providing managed hosting and simplified deployment compared to traditional infrastructure.', type: 'Technology', maturityStageId: 2 },
      { name: 'Load Balanced Applications', description: 'Distribution of application traffic across multiple servers for improved performance and availability. Initial technology providing scalability and reliability before implementing advanced orchestration.', type: 'Technology', maturityStageId: 2 },
      { name: 'Application Accessibility Standards Implementation', description: 'Systematic implementation of accessibility standards with testing and validation procedures. Structured process introducing systematic procedures and governance to improve upon manual approaches.', type: 'Process', maturityStageId: 2 },
      { name: 'Standard Deployment Procedures', description: 'Standardized application deployment procedures with consistent processes and quality gates. Systematic process introducing structured procedures and governance to improve upon manual approaches.', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { name: 'Azure Functions', description: 'Serverless compute platform enabling event-driven applications with automatic scaling and pay-per-execution billing. Cloud-native technology offering sophisticated capabilities with enhanced developer productivity and seamless Azure integration.', type: 'Technology', maturityStageId: 3 },
      { name: 'Azure Container Instances', description: 'Serverless container hosting with rapid deployment and automatic scaling capabilities. Advanced technology providing containerized application hosting without infrastructure management.', type: 'Technology', maturityStageId: 3 },
      { name: 'Multi-Platform Application Deployment Process', description: 'Cross-platform deployment procedures supporting multiple operating systems and cloud environments. Deployment process providing sophisticated procedures with automation and enhanced portability capabilities.', type: 'Process', maturityStageId: 3 },
      { name: 'Progressive Web App Development Workflow', description: 'Development workflow for progressive web applications with offline capabilities and native-like experiences. Development process providing sophisticated procedures with automation and enhanced user experience capabilities.', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { name: 'Serverless Computing Platforms', description: 'Event-driven, fully managed compute services that automatically scale and manage infrastructure. Optimal technology eliminating infrastructure management while providing unlimited scalability.', type: 'Technology', maturityStageId: 4 },
      { name: 'Micro-Frontend Architecture', description: 'Distributed frontend architecture enabling independent development and deployment of application components. Optimal technology providing maximum development agility and scalability.', type: 'Technology', maturityStageId: 4 },
      { name: 'AI-Driven Application Optimization', description: 'Machine learning-powered application optimization providing performance tuning and resource efficiency improvements. Intelligence process representing the pinnacle of application performance with AI-driven automation and predictive capabilities.', type: 'Process', maturityStageId: 4 },
      { name: 'Adaptive User Experience Process', description: 'Dynamic user experience optimization based on user behavior and preferences with personalization. UX process representing the pinnacle of user interaction with AI-driven automation and predictive capabilities.', type: 'Process', maturityStageId: 4 }
    ],

    // Applications & Workloads Pillar - Secure Application Development & Deployment Workflow Function
    'Secure Application Development & Deployment Workflow': [
      // Traditional (1)
      { name: 'Manual Code Reviews', description: 'Human-conducted examination of source code for security vulnerabilities and coding standards compliance. Traditional technology establishing code quality discipline before implementing automated scanning and analysis tools.', type: 'Technology', maturityStageId: 1 },
      { name: 'Basic Version Control', description: 'Simple source code management systems for tracking changes and maintaining code history. Traditional technology providing code management foundation before implementing collaborative development and security integration.', type: 'Technology', maturityStageId: 1 },
      { name: 'Manual Security Testing', description: 'Human-performed security assessment of applications including penetration testing and vulnerability analysis. Traditional process establishing security validation discipline before implementing automated testing and continuous security assessment.', type: 'Process', maturityStageId: 1 },
      { name: 'Basic Change Management', description: 'Manual approval and tracking processes for application changes and deployments. Traditional process providing change control foundation before implementing automated workflows and security gates.', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { name: 'Git with Basic CI/CD', description: 'Version control with simple automated build and deployment pipelines. Initial technology improving development efficiency and consistency while beginning to integrate security into the development process.', type: 'Technology', maturityStageId: 2 },
      { name: 'Automated Build Systems', description: 'Automated compilation, testing, and packaging of applications from source code. Initial technology reducing manual effort and improving consistency in application delivery.', type: 'Technology', maturityStageId: 2 },
      { name: 'Code Review Process', description: 'Structured peer review procedures for evaluating code quality, security, and adherence to standards. Initial process ensuring code quality and security awareness before implementing automated analysis.', type: 'Process', maturityStageId: 2 },
      { name: 'Basic Security Integration', description: 'Foundational integration of security tools and processes into the development workflow. Starting process beginning to shift security left in the development lifecycle.', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { name: 'Azure DevOps Security Integration', description: 'Comprehensive security tooling integrated into Azure DevOps pipelines for automated security testing. Advanced technology providing seamless security integration throughout the development and deployment process.', type: 'Technology', maturityStageId: 3 },
      { name: 'Azure Container Registry Security Scanning', description: 'Automated vulnerability scanning of container images before deployment with policy enforcement. Advanced technology ensuring container security and compliance before production deployment.', type: 'Technology', maturityStageId: 3 },
      { name: 'Secure Software Development Lifecycle Process', description: 'Comprehensive security-integrated development methodology from design through deployment and maintenance. Advanced process ensuring security considerations are embedded throughout the application lifecycle.', type: 'Process', maturityStageId: 3 },
      { name: 'Security Code Review and Approval Workflow', description: 'Automated security analysis combined with expert review for comprehensive code security validation. Advanced process providing thorough security assessment with both automated and human expertise.', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { name: 'GitHub Advanced Security', description: 'Comprehensive security platform with code scanning, secret detection, and dependency analysis. Optimal technology providing AI-powered security analysis integrated into the development workflow.', type: 'Technology', maturityStageId: 4 },
      { name: 'AI-Powered Security Analysis', description: 'Machine learning-based analysis of code, dependencies, and deployment configurations for security risks. Optimal technology providing intelligent security insights and automated vulnerability detection.', type: 'Technology', maturityStageId: 4 },
      { name: 'DevSecOps Pipeline Implementation', description: 'Fully integrated security automation throughout the development, deployment, and operations pipeline. Optimal process providing continuous security validation and automated remediation.', type: 'Process', maturityStageId: 4 },
      { name: 'Autonomous Security Validation', description: 'AI-driven security testing and validation with automated remediation and deployment decisions. Optimal process providing self-healing security with minimal human intervention.', type: 'Process', maturityStageId: 4 }
    ],

    // Applications & Workloads Pillar - Application Security Testing Function
    'Application Security Testing': [
      // Traditional (1)
      { name: 'Manual Penetration Testing', description: 'Human-conducted ethical hacking and security assessment of applications to identify vulnerabilities. Traditional technology providing thorough security validation before implementing automated testing and continuous security assessment.', type: 'Technology', maturityStageId: 1 },
      { name: 'Basic Vulnerability Scanners', description: 'Simple automated tools for identifying known security vulnerabilities in applications and infrastructure. Traditional technology providing initial security automation before implementing comprehensive security testing platforms.', type: 'Technology', maturityStageId: 1 },
      { name: 'Annual Security Assessments', description: 'Periodic comprehensive security evaluations of applications and systems. Traditional process establishing security validation discipline before implementing continuous testing and monitoring.', type: 'Process', maturityStageId: 1 },
      { name: 'Manual Vulnerability Management', description: 'Human-driven processes for tracking, prioritizing, and remediating identified security vulnerabilities. Traditional process providing vulnerability governance before implementing automated workflows and risk-based prioritization.', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { name: 'Automated Vulnerability Scanners', description: 'Regular automated scanning tools for identifying security vulnerabilities with improved coverage and frequency. Initial technology increasing security testing efficiency and consistency.', type: 'Technology', maturityStageId: 2 },
      { name: 'Basic Static Analysis Tools', description: 'Automated source code analysis tools for identifying security vulnerabilities and coding standard violations. Initial technology providing early security feedback in the development process.', type: 'Technology', maturityStageId: 2 },
      { name: 'Regular Security Testing Schedule', description: 'Systematic scheduling of security tests and assessments throughout the application lifecycle. Initial process ensuring consistent security validation before implementing continuous testing.', type: 'Process', maturityStageId: 2 },
      { name: 'Vulnerability Tracking Process', description: 'Structured procedures for documenting, tracking, and managing identified security vulnerabilities through resolution. Initial process providing vulnerability governance and accountability.', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { name: 'Azure Security Center for Applications', description: 'Cloud-based security management platform providing vulnerability assessment and security recommendations for applications. Advanced technology offering comprehensive security visibility and guidance.', type: 'Technology', maturityStageId: 3 },
      { name: 'Static Application Security Testing (SAST) Tools', description: 'Source code analysis tools integrated into development pipelines for early vulnerability detection. Code analysis technology providing comprehensive security scanning with detailed remediation guidance.', type: 'Technology', maturityStageId: 3 },
      { name: 'Dynamic Application Security Testing (DAST) Tools', description: 'Runtime application security testing tools that assess running applications for vulnerabilities. Advanced technology providing real-world security testing of application behavior and responses.', type: 'Technology', maturityStageId: 3 },
      { name: 'Automated Security Testing Integration Process', description: 'Seamless integration of multiple security testing tools into CI/CD pipelines with automated reporting. Advanced process ensuring comprehensive security testing without disrupting development velocity.', type: 'Process', maturityStageId: 3 },
      { name: 'Vulnerability Management for Applications Process', description: 'Comprehensive workflow for managing application vulnerabilities from discovery through resolution with risk-based prioritization. Advanced process providing efficient vulnerability remediation with business context.', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { name: 'AI-Powered Security Testing', description: 'Machine learning-enhanced security testing that adapts testing strategies based on application behavior and threat intelligence. Optimal technology providing intelligent, evolving security testing capabilities.', type: 'Technology', maturityStageId: 4 },
      { name: 'Interactive Application Security Testing (IAST)', description: 'Real-time security analysis that combines static and dynamic testing for comprehensive vulnerability detection during runtime. Optimal technology providing the most complete application security assessment.', type: 'Technology', maturityStageId: 4 },
      { name: 'Penetration Testing Coordination Workflow', description: 'Orchestration platform for automated and manual penetration testing with intelligent test case generation. Testing process providing comprehensive security validation with efficient resource utilization.', type: 'Process', maturityStageId: 4 },
      { name: 'Continuous Security Validation', description: 'Ongoing, automated security testing and validation throughout the application lifecycle with real-time threat adaptation. Optimal process providing persistent security assurance with minimal manual intervention.', type: 'Process', maturityStageId: 4 }
    ],

    // Data Pillar - Data Inventory Function
    'Data Inventory': [
      // Traditional (1)
      { name: 'Manual Data Inventories', description: 'Basic manual processes for identifying and documenting data assets across the organization. Traditional approach providing the foundation for data governance before implementing automated discovery and cataloging systems.', type: 'Technology', maturityStageId: 1 },
      { name: 'Spreadsheet-Based Data Tracking', description: 'Simple spreadsheet systems for maintaining records of data assets and their characteristics. Traditional technology establishing basic data documentation before implementing dedicated data management platforms.', type: 'Technology', maturityStageId: 1 },
      { name: 'Annual Data Discovery Exercises', description: 'Periodic manual exercises to identify and catalog organizational data assets. Traditional process establishing data governance discipline before implementing continuous discovery and monitoring.', type: 'Process', maturityStageId: 1 },
      { name: 'Manual Data Documentation', description: 'Manual procedures for documenting data sources, formats, and usage patterns. Traditional process providing baseline data understanding before implementing automated metadata management.', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { name: 'Basic Data Discovery Tools', description: 'Simple automated tools for scanning and identifying data assets across systems. Initial technology improving discovery efficiency and accuracy while maintaining manageable complexity for most organizations.', type: 'Technology', maturityStageId: 2 },
      { name: 'Simple Data Cataloging Systems', description: 'Basic systems for organizing and cataloging discovered data assets with metadata. Initial technology providing centralized data visibility and search capabilities for improved data governance.', type: 'Technology', maturityStageId: 2 },
      { name: 'Data Asset Discovery and Cataloging Process', description: 'Structured processes for systematically discovering and cataloging data assets. Initial process bringing consistency and thoroughness to data inventory management before implementing advanced automation.', type: 'Process', maturityStageId: 2 },
      { name: 'Structured Data Documentation Process', description: 'Formal procedures for documenting data assets with standardized metadata schemas. Initial process ensuring consistent data description and facilitating data discovery and governance.', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { name: 'Azure Data Factory Data Lineage', description: 'Data lineage tracking platform showing data movement and transformation across systems and pipelines. Data governance technology providing comprehensive visibility into data flows and dependencies for sophisticated governance.', type: 'Technology', maturityStageId: 3 },
      { name: 'Microsoft 365 Data Classification', description: 'Automated classification of data based on content analysis and policy rules. Advanced technology enabling intelligent data categorization and appropriate protection based on data sensitivity and business value.', type: 'Technology', maturityStageId: 3 },
      { name: 'Data Ownership Assignment Workflow', description: 'Systematic workflows for identifying and assigning data stewards and owners. Advanced process ensuring accountability and governance for data assets while supporting business decision-making.', type: 'Process', maturityStageId: 3 },
      { name: 'Data Quality Assessment Procedures', description: 'Comprehensive procedures for evaluating and maintaining data quality standards. Advanced process ensuring data reliability and trustworthiness for business operations and analytics.', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { name: 'Microsoft Purview Data Catalog', description: 'AI-powered unified data catalog providing comprehensive data discovery, lineage, and governance across hybrid environments. Optimal technology offering the most advanced data governance capabilities.', type: 'Technology', maturityStageId: 4 },
      { name: 'AI-Powered Data Discovery', description: 'Machine learning-driven automatic discovery and classification of data assets with intelligent recommendations. Optimal technology providing autonomous data governance with predictive insights.', type: 'Technology', maturityStageId: 4 },
      { name: 'Autonomous Data Cataloging Process', description: 'AI-driven automatic cataloging of data assets with intelligent metadata generation. Optimal process providing self-maintaining data inventory that adapts to changing data landscapes automatically.', type: 'Process', maturityStageId: 4 },
      { name: 'Intelligent Data Lineage Tracking', description: 'AI-powered comprehensive tracking of data lineage across complex, dynamic environments. Optimal process providing complete data visibility and impact analysis for sophisticated data governance and risk management.', type: 'Process', maturityStageId: 4 }
    ],

    // Data Pillar - Data Categorization Function
    'Data Categorization': [
      // Traditional (1)
      { name: 'Manual Data Classification', description: 'Human-driven identification and labeling of data based on sensitivity, regulatory requirements, and business value. Traditional technology establishing data categorization discipline before implementing automated classification systems.', type: 'Technology', maturityStageId: 1 },
      { name: 'Basic File Naming Conventions', description: 'Standardized naming schemes for files and documents to indicate data sensitivity and handling requirements. Traditional technology providing basic data organization before implementing metadata-driven classification.', type: 'Technology', maturityStageId: 1 },
      { name: 'Manual Data Labeling Process', description: 'Human-performed assignment of sensitivity labels and handling instructions to data assets. Traditional process establishing data protection awareness before implementing automated labeling and policy enforcement.', type: 'Process', maturityStageId: 1 },
      { name: 'Basic Data Handling Procedures', description: 'Fundamental processes for managing data according to its classification and sensitivity level. Traditional process providing data protection foundation before implementing automated controls and monitoring.', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { name: 'Basic Data Classification Tools', description: 'Simple automated tools for identifying and categorizing data based on content and context. Initial technology improving classification accuracy and consistency over manual processes.', type: 'Technology', maturityStageId: 2 },
      { name: 'Standard Data Labels', description: 'Standardized classification schemas and labeling systems for consistent data handling. Initial technology providing data categorization foundation before implementing advanced policy automation.', type: 'Technology', maturityStageId: 2 },
      { name: 'Data Classification Policy Framework', description: 'Structured data classification policies with consistent categorization and handling requirements. Policy process introducing structured procedures and governance to improve upon manual approaches.', type: 'Process', maturityStageId: 2 },
      { name: 'Structured Data Handling Process', description: 'Systematic data handling procedures with standardized workflows and compliance requirements. Handling process introducing structured procedures and governance to improve upon manual approaches.', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { name: 'Azure Information Protection', description: 'Classification, labeling, and protection service for documents and emails with persistent protection. Advanced technology providing comprehensive data protection that travels with the data.', type: 'Technology', maturityStageId: 3 },
      { name: 'Microsoft 365 Sensitivity Labels', description: 'Information protection labels for Microsoft 365 with automated classification and policy enforcement. Data protection technology offering sophisticated capabilities with enhanced security features and seamless integration.', type: 'Technology', maturityStageId: 3 },
      { name: 'Automated Data Labeling Workflow', description: 'Automated data classification and labeling workflow with policy-driven protection and monitoring. Classification process providing sophisticated procedures with automation and enhanced security capabilities.', type: 'Process', maturityStageId: 3 },
      { name: 'Data Handling Standards Implementation', description: 'Implementation procedures for data handling standards with monitoring and compliance validation. Standards process providing sophisticated procedures with automation and enhanced compliance capabilities.', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { name: 'Microsoft Purview Data Classification', description: 'Microsoft purview data classification representing the most sophisticated data governance technology with AI-powered automation and comprehensive protection.', type: 'Technology', maturityStageId: 4 },
      { name: 'AI-Powered Data Classification', description: 'Ai-powered data classification representing the most sophisticated data governance technology with AI-powered automation and comprehensive protection.', type: 'Technology', maturityStageId: 4 },
      { name: 'Intelligent Data Categorization Process', description: 'Intelligent data categorization process representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Process', maturityStageId: 4 },
      { name: 'Adaptive Data Classification Rules', description: 'Adaptive data classification rules representing the most sophisticated data governance technology with AI-powered automation and comprehensive protection.', type: 'Process', maturityStageId: 4 }
    ],

    // Data Pillar - Data Availability Function
    'Data Availability': [
      // Traditional (1)
      { name: 'Basic File Backups', description: 'Simple file copying and storage systems for data protection and recovery purposes. Traditional technology providing basic data protection before implementing automated backup and disaster recovery systems.', type: 'Technology', maturityStageId: 1 },
      { name: 'Manual Data Recovery Systems', description: 'Human-operated procedures for restoring data from backups during system failures. Traditional technology requiring manual intervention before implementing automated recovery and business continuity systems.', type: 'Technology', maturityStageId: 1 },
      { name: 'Weekly Manual Backups', description: 'Weekly manual backups providing basic data protection before implementing automated and comprehensive backup systems.', type: 'Process', maturityStageId: 1 },
      { name: 'Basic Disaster Recovery Planning', description: 'Fundamental disaster recovery planning establishing baseline recovery procedures and documentation. Foundational procedures that establish baseline capabilities before implementing automated recovery solutions.', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { name: 'Azure Backup and Restore Services', description: 'Cloud-based backup and recovery services with automated scheduling and retention policies. Initial technology providing reliable data protection with reduced infrastructure management overhead.', type: 'Technology', maturityStageId: 2 },
      { name: 'Basic Database Replication', description: 'Simple database mirroring and replication for data availability and basic disaster recovery. Initial technology improving data resilience before implementing advanced geo-replication and failover.', type: 'Technology', maturityStageId: 2 },
      { name: 'Data Backup and Recovery Planning', description: 'Stage data backup and recovery planning improving backup reliability and management over manual processes.', type: 'Process', maturityStageId: 2 },
      { name: 'Scheduled Data Backup Process', description: 'Stage scheduled data backup process improving backup reliability and management over manual processes.', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { name: 'Azure SQL Database High Availability', description: 'Azure sql database high availability providing enterprise-grade database capabilities with high availability and comprehensive management features.', type: 'Technology', maturityStageId: 3 },
      { name: 'Multi-Zone Data Replication', description: 'Multi-zone data replication providing enterprise-grade data protection with automated failover and cross-regional synchronization.', type: 'Technology', maturityStageId: 3 },
      { name: 'Business Continuity for Data Services', description: 'Business continuity for data services providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Process', maturityStageId: 3 },
      { name: 'Data Replication and Synchronization Process', description: 'Data replication and synchronization process providing enterprise-grade data protection with automated failover and cross-regional synchronization.', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { name: 'Azure Cosmos DB Global Distribution', description: 'Azure cosmos db global distribution representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Technology', maturityStageId: 4 },
      { name: 'AI-Driven Data Availability Management', description: 'Ai-driven data availability management representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Technology', maturityStageId: 4 },
      { name: 'Autonomous Data Recovery Process', description: 'Autonomous data recovery process representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Process', maturityStageId: 4 },
      { name: 'Predictive Data Availability Monitoring', description: 'Predictive data availability monitoring representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Process', maturityStageId: 4 }
    ],

    // Data Pillar - Data Access Function
    'Data Access': [
      // Traditional (1)
      { name: 'Basic File Permissions', description: 'Fundamental file system access controls for restricting data access by user and group. Traditional technology providing basic data security before implementing advanced access controls and data loss prevention.', type: 'Technology', maturityStageId: 1 },
      { name: 'Manual Access Control Lists', description: 'Manual configuration of data access permissions and restrictions. Traditional technology requiring manual administration before implementing automated access governance and policy-driven controls.', type: 'Technology', maturityStageId: 1 },
      { name: 'Manual Data Access Approval', description: 'Manual data access approval providing foundational capabilities before implementing advanced automated solutions.', type: 'Process', maturityStageId: 1 },
      { name: 'Basic Data Access Logging', description: 'Basic data access logging providing foundational capabilities before implementing advanced automated solutions.', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { name: 'Role-Based Data Access Control', description: 'Access control system based on user roles and responsibilities rather than individual permissions. Initial technology improving access management scalability and reducing administrative overhead.', type: 'Technology', maturityStageId: 2 },
      { name: 'Basic Data Access Monitoring', description: 'Simple logging and monitoring of data access activities for security and compliance. Initial technology providing access visibility before implementing advanced analytics and anomaly detection.', type: 'Technology', maturityStageId: 2 },
      { name: 'Data Access Control Policy Framework', description: 'Stage data access control policy framework providing structured data management with improved consistency and governance.', type: 'Process', maturityStageId: 2 },
      { name: 'Regular Data Access Reviews', description: 'Stage regular data access reviews providing structured data management with improved consistency and governance.', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { name: 'Azure Role-Based Access Control for Data', description: 'Azure role-based access control for data providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Technology', maturityStageId: 3 },
      { name: 'Azure Data Loss Prevention', description: 'Azure data loss prevention providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Technology', maturityStageId: 3 },
      { name: 'Data Access Request and Approval Workflow', description: 'Data access request and approval workflow providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Process', maturityStageId: 3 },
      { name: 'Data Access Monitoring and Auditing Process', description: 'Data access monitoring and auditing process providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { name: 'Azure Privileged Identity Management for Data', description: 'Azure privileged identity management for data representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Technology', maturityStageId: 4 },
      { name: 'AI-Powered Data Access Analytics', description: 'Ai-powered data access analytics representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Technology', maturityStageId: 4 },
      { name: 'Zero Trust Data Access Framework', description: 'Zero trust data access framework representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Process', maturityStageId: 4 },
      { name: 'Continuous Data Access Evaluation', description: 'Continuous data access evaluation representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Process', maturityStageId: 4 }
    ],

    // Data Pillar - Data Encryption Function
    'Data Encryption': [
      // Traditional (1)
      { name: 'Basic Password Protection', description: 'Simple password-based protection for files and data repositories. Traditional technology providing basic data confidentiality before implementing encryption and advanced data protection systems.', type: 'Technology', maturityStageId: 1 },
      { name: 'Manual File Encryption', description: 'Human-performed encryption of individual files and documents for data protection. Traditional technology providing basic confidentiality before implementing automated encryption and key management systems.', type: 'Technology', maturityStageId: 1 },
      { name: 'Basic Encryption Standards', description: 'Basic encryption standards providing foundational capabilities before implementing advanced automated solutions.', type: 'Process', maturityStageId: 1 },
      { name: 'Manual Key Management', description: 'Manual key management providing foundational capabilities before implementing advanced automated solutions.', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { name: 'Azure Disk Encryption', description: 'Automatic encryption of virtual machine disks and storage volumes in Azure. Initial technology providing data at rest protection with centralized key management.', type: 'Technology', maturityStageId: 2 },
      { name: 'Azure Storage Service Encryption', description: 'Built-in encryption for Azure storage services with automatic key management. Initial technology providing transparent data protection without application changes.', type: 'Technology', maturityStageId: 2 },
      { name: 'Data Encryption Standards Implementation', description: 'Stage data encryption standards implementation providing structured data management with improved consistency and governance.', type: 'Process', maturityStageId: 2 },
      { name: 'Basic Key Lifecycle Management', description: 'Stage basic key lifecycle management providing enhanced capabilities with improved structure and governance.', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { name: 'Azure Key Vault', description: 'Azure key vault providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Technology', maturityStageId: 3 },
      { name: 'Database-Level Encryption', description: 'Database-level encryption providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Technology', maturityStageId: 3 },
      { name: 'Encryption Key Management Process', description: 'Encryption key management process providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Process', maturityStageId: 3 },
      { name: 'Automated Key Rotation Procedures', description: 'Automated key rotation procedures providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { name: 'Customer-Managed Keys (CMK)', description: 'Customer-managed keys (cmk) representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Technology', maturityStageId: 4 },
      { name: 'Zero-Knowledge Encryption', description: 'Zero-knowledge encryption representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Technology', maturityStageId: 4 },
      { name: 'Customer-Managed Key Rotation Workflow', description: 'Customer-managed key rotation workflow representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Process', maturityStageId: 4 },
      { name: 'AI-Driven Encryption Optimization', description: 'Ai-driven encryption optimization representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Process', maturityStageId: 4 }
    ],

    // Data Pillar - Visibility & Analytics Capability
    'Data Visibility & Analytics': [
      // Traditional (1)
      { name: 'Basic Database Reports', description: 'Simple query-based reports generated from database systems for business intelligence. Traditional technology providing basic data analysis before implementing advanced analytics and visualization platforms.', type: 'Technology', maturityStageId: 1 },
      { name: 'Manual Data Analysis', description: 'Human-performed analysis of data using spreadsheets and basic tools. Traditional technology providing foundational analytics before implementing automated analysis and machine learning platforms.', type: 'Technology', maturityStageId: 1 },
      { name: 'Weekly Data Usage Reports', description: 'Weekly data usage reports providing foundational capabilities before implementing advanced automated solutions.', type: 'Process', maturityStageId: 1 },
      { name: 'Basic Data Quality Checks', description: 'Basic data quality checks providing foundational capabilities before implementing advanced automated solutions.', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { name: 'Business Intelligence Tools', description: 'Self-service analytics and reporting tools enabling business users to create reports and dashboards. Initial technology democratizing data analysis beyond traditional IT-managed reports.', type: 'Technology', maturityStageId: 2 },
      { name: 'Centralized Data Logging', description: 'Unified log collection and storage system providing centralized visibility across systems. Initial technology improving troubleshooting and analysis capabilities.', type: 'Technology', maturityStageId: 2 },
      { name: 'Data Analytics Dashboard Creation', description: 'Stage data analytics dashboard creation providing structured data management with improved consistency and governance.', type: 'Process', maturityStageId: 2 },
      { name: 'Regular Data Performance Reporting', description: 'Stage regular data performance reporting providing structured data management with improved consistency and governance.', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { name: 'Azure Synapse Analytics', description: 'Azure synapse analytics providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Technology', maturityStageId: 3 },
      { name: 'Power BI for Data Visualization', description: 'Power bi for data visualization providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Technology', maturityStageId: 3 },
      { name: 'Data Security Incident Response', description: 'Data security incident response providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Process', maturityStageId: 3 },
      { name: 'Data Compliance Reporting Process', description: 'Data compliance reporting process providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { name: 'AI-Powered Data Analytics', description: 'Ai-powered data analytics representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Technology', maturityStageId: 4 },
      { name: 'Real-time Data Intelligence', description: 'Real-time data intelligence representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Technology', maturityStageId: 4 },
      { name: 'Predictive Data Analysis', description: 'Predictive data analysis representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Process', maturityStageId: 4 },
      { name: 'Autonomous Data Optimization', description: 'Autonomous data optimization representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Process', maturityStageId: 4 }
    ],

    // Data Pillar - Automation & Orchestration Capability
    'Data Automation & Orchestration': [
      // Traditional (1)
      { name: 'Manual Data Processing', description: 'Human-performed data transformation, cleaning, and manipulation tasks. Traditional technology providing basic data management before implementing automated ETL pipelines and data processing platforms.', type: 'Technology', maturityStageId: 1 },
      { name: 'Basic Data Scripts', description: 'Simple scripts for data manipulation, transformation, and basic automation tasks. Traditional technology providing initial automation before implementing comprehensive data processing and pipeline systems.', type: 'Technology', maturityStageId: 1 },
      { name: 'Manual Data Pipeline Management', description: 'Manual data pipeline management providing foundational capabilities before implementing advanced automated solutions.', type: 'Process', maturityStageId: 1 },
      { name: 'Email-Based Data Requests', description: 'Email-based data requests providing foundational capabilities before implementing advanced automated solutions.', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { name: 'Basic ETL Tools', description: 'Extract, Transform, Load tools for automated data integration and processing workflows. Initial technology replacing manual data processing with repeatable, scheduled automation.', type: 'Technology', maturityStageId: 2 },
      { name: 'Scheduled Data Processing', description: 'Automated data processing workflows with scheduling and dependency management. Initial technology providing consistent data processing without manual intervention.', type: 'Technology', maturityStageId: 2 },
      { name: 'Semi-Automated Data Pipeline Process', description: 'Stage semi-automated data pipeline process providing structured data management with improved consistency and governance.', type: 'Process', maturityStageId: 2 },
      { name: 'Standardized Data Request Workflow', description: 'Stage standardized data request workflow providing structured data management with improved consistency and governance.', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { name: 'Azure Data Factory', description: 'Cloud-based data integration service for creating, scheduling, and managing data pipelines at scale. Advanced technology providing sophisticated ETL/ELT capabilities with enterprise integration.', type: 'Technology', maturityStageId: 3 },
      { name: 'Azure Logic Apps for Data Workflows', description: 'Azure logic apps for data workflows providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Technology', maturityStageId: 3 },
      { name: 'Automated Data Pipeline Deployment', description: 'Automated data pipeline deployment providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Process', maturityStageId: 3 },
      { name: 'Self-Service Data Provisioning', description: 'Self-service data provisioning providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { name: 'AI-Driven Data Orchestration', description: 'Ai-driven data orchestration representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Technology', maturityStageId: 4 },
      { name: 'Intelligent Data Processing', description: 'Intelligent data processing representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Technology', maturityStageId: 4 },
      { name: 'Autonomous Data Management', description: 'Autonomous data management representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Process', maturityStageId: 4 },
      { name: 'Adaptive Data Processing Optimization', description: 'Adaptive data processing optimization representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Process', maturityStageId: 4 }
    ],

    // Data Pillar - Governance Capability
    'Data Governance': [
      // Traditional (1)
      { name: 'Manual Data Policy Documentation', description: 'Human-created documentation of data handling policies and compliance requirements. Traditional technology providing basic governance before implementing automated policy management and compliance monitoring.', type: 'Technology', maturityStageId: 1 },
      { name: 'Basic Data Compliance Tracking', description: 'Simple tracking systems for monitoring adherence to data policies and regulations. Traditional technology providing basic compliance oversight before implementing automated monitoring and reporting systems.', type: 'Technology', maturityStageId: 1 },
      { name: 'Annual Data Audits', description: 'Annual data audits providing foundational capabilities before implementing advanced automated solutions.', type: 'Process', maturityStageId: 1 },
      { name: 'Manual Data Policy Enforcement', description: 'Manual data policy enforcement providing foundational capabilities before implementing advanced automated solutions.', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { name: 'Data Governance Platforms', description: 'Centralized platforms for managing data policies, lineage, and compliance requirements. Initial technology providing systematic governance before implementing advanced automation and AI-driven insights.', type: 'Technology', maturityStageId: 2 },
      { name: 'Basic Data Governance Dashboards', description: 'Stage basic data governance dashboards providing structured data management with improved consistency and governance.', type: 'Technology', maturityStageId: 2 },
      { name: 'Data Governance Policy Framework', description: 'Stage data governance policy framework providing structured data management with improved consistency and governance.', type: 'Process', maturityStageId: 2 },
      { name: 'Quarterly Data Governance Reviews', description: 'Stage quarterly data governance reviews providing structured data management with improved consistency and governance.', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { name: 'Microsoft Purview for Data Governance', description: 'Microsoft purview for data governance providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Technology', maturityStageId: 3 },
      { name: 'Automated Data Compliance Monitoring', description: 'Automated data compliance monitoring providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Technology', maturityStageId: 3 },
      { name: 'Data Risk Management Process', description: 'Data risk management process providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Process', maturityStageId: 3 },
      { name: 'Data Compliance Audit Procedures', description: 'Data compliance audit procedures providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { name: 'AI-Powered Data Governance', description: 'Ai-powered data governance representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Technology', maturityStageId: 4 },
      { name: 'Continuous Data Compliance Validation', description: 'Continuous data compliance validation representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Technology', maturityStageId: 4 },
      { name: 'Adaptive Data Governance Process', description: 'Adaptive data governance process representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Process', maturityStageId: 4 },
      { name: 'Predictive Data Risk Management', description: 'Predictive data risk management representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Process', maturityStageId: 4 }
    ],

    // Networks Pillar - Visibility & Analytics Capability
    'Network Visibility & Analytics': [
      // Traditional (1)
      { name: 'Basic Network Monitoring Tools', description: 'Simple monitoring systems for tracking network performance and basic health metrics. Traditional technology providing fundamental visibility before implementing advanced analytics and AI-powered monitoring.', type: 'Technology', maturityStageId: 1 },
      { name: 'Simple Network Analyzers', description: 'Basic packet capture and analysis tools for troubleshooting network issues. Traditional technology providing manual analysis before implementing automated threat detection and network intelligence platforms.', type: 'Technology', maturityStageId: 1 },
      { name: 'Manual Network Traffic Analysis', description: 'Manual network traffic analysis providing foundational capabilities before implementing advanced automated solutions.', type: 'Process', maturityStageId: 1 },
      { name: 'Weekly Network Performance Reviews', description: 'Weekly network performance reviews providing foundational capabilities before implementing advanced automated solutions.', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { name: 'Azure Network Watcher', description: 'Stage azure network watcher providing enhanced capabilities with improved structure and governance.', type: 'Technology', maturityStageId: 2 },
      { name: 'Centralized Network Logging', description: 'Stage centralized network logging providing enhanced capabilities with improved structure and governance.', type: 'Technology', maturityStageId: 2 },
      { name: 'Network Performance Monitoring Process', description: 'Stage network performance monitoring process providing enhanced capabilities with improved structure and governance.', type: 'Process', maturityStageId: 2 },
      { name: 'Regular Network Security Assessments', description: 'Stage regular network security assessments providing enhanced capabilities with improved structure and governance.', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { name: 'Azure Monitor for Networks', description: 'Azure monitor for networks providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Technology', maturityStageId: 3 },
      { name: 'Network Traffic Analytics', description: 'Network traffic analytics providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Technology', maturityStageId: 3 },
      { name: 'Proactive Network Threat Detection', description: 'Proactive network threat detection providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Process', maturityStageId: 3 },
      { name: 'Network Compliance Reporting Process', description: 'Network compliance reporting process providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { name: 'AI-Powered Network Analytics', description: 'Ai-powered network analytics representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Technology', maturityStageId: 4 },
      { name: 'Real-time Network Intelligence', description: 'Real-time network intelligence representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Technology', maturityStageId: 4 },
      { name: 'Predictive Network Analysis', description: 'Predictive network analysis representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Process', maturityStageId: 4 },
      { name: 'Automated Network Anomaly Response', description: 'Automated network anomaly response representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Process', maturityStageId: 4 }
    ],

    // Networks Pillar - Automation & Orchestration Capability
    'Network Automation & Orchestration': [
      // Traditional (1)
      { name: 'Manual Network Configuration', description: 'Human-performed setup and configuration of network devices and services. Traditional technology requiring manual administration before implementing infrastructure as code and automated network management.', type: 'Technology', maturityStageId: 1 },
      { name: 'Basic Scripting Tools', description: 'Simple automation scripts for repetitive network configuration and management tasks. Traditional technology providing initial automation before implementing comprehensive orchestration and policy-driven network management.', type: 'Technology', maturityStageId: 1 },
      { name: 'Manual Network Provisioning', description: 'Manual network provisioning providing foundational capabilities before implementing advanced automated solutions.', type: 'Process', maturityStageId: 1 },
      { name: 'Email-Based Change Requests', description: 'Email-based change requests providing foundational capabilities before implementing advanced automated solutions.', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { name: 'PowerShell for Network Automation', description: 'Stage powershell for network automation providing enhanced capabilities with improved structure and governance.', type: 'Technology', maturityStageId: 2 },
      { name: 'Azure Resource Manager Templates', description: 'Stage azure resource manager templates providing enhanced capabilities with improved structure and governance.', type: 'Technology', maturityStageId: 2 },
      { name: 'Semi-Automated Network Deployment', description: 'Stage semi-automated network deployment providing enhanced capabilities with improved structure and governance.', type: 'Process', maturityStageId: 2 },
      { name: 'Standardized Configuration Management', description: 'Stage standardized configuration management providing enhanced capabilities with improved structure and governance.', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { name: 'Azure Logic Apps for Network Workflows', description: 'Azure logic apps for network workflows providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Technology', maturityStageId: 3 },
      { name: 'Terraform for Infrastructure as Code', description: 'Terraform for infrastructure as code providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Technology', maturityStageId: 3 },
      { name: 'Automated Network Provisioning Process', description: 'Automated network provisioning process providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Process', maturityStageId: 3 },
      { name: 'Self-Service Network Request Workflow', description: 'Self-service network request workflow providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { name: 'AI-Driven Network Orchestration', description: 'Ai-driven network orchestration representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Technology', maturityStageId: 4 },
      { name: 'Intent-Based Networking', description: 'Intent-based networking representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Technology', maturityStageId: 4 },
      { name: 'Autonomous Network Management', description: 'Autonomous network management representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Process', maturityStageId: 4 },
      { name: 'Intelligent Network Optimization', description: 'Intelligent network optimization representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Process', maturityStageId: 4 }
    ],

    // Networks Pillar - Governance Capability
    'Network Governance': [
      // Traditional (1)
      { name: 'Manual Network Documentation', description: 'Human-created documentation of network topology, configurations, and asset information. Traditional technology providing basic asset tracking before implementing automated discovery and configuration management systems.', type: 'Technology', maturityStageId: 1 },
      { name: 'Basic Network Inventory Systems', description: 'Simple tracking systems for recording network devices, connections, and configurations. Traditional technology providing manual asset management before implementing automated discovery and comprehensive asset lifecycle management.', type: 'Technology', maturityStageId: 1 },
      { name: 'Annual Network Audits', description: 'Annual network audits providing foundational capabilities before implementing advanced automated solutions.', type: 'Process', maturityStageId: 1 },
      { name: 'Manual Policy Enforcement', description: 'Manual policy enforcement providing foundational capabilities before implementing advanced automated solutions.', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { name: 'Network Configuration Management Database', description: 'Stage network configuration management database providing structured data management with improved consistency and governance.', type: 'Technology', maturityStageId: 2 },
      { name: 'Basic Network Governance Dashboards', description: 'Stage basic network governance dashboards providing enhanced capabilities with improved structure and governance.', type: 'Technology', maturityStageId: 2 },
      { name: 'Network Governance Policy Framework', description: 'Stage network governance policy framework providing enhanced capabilities with improved structure and governance.', type: 'Process', maturityStageId: 2 },
      { name: 'Quarterly Network Compliance Reviews', description: 'Stage quarterly network compliance reviews providing enhanced capabilities with improved structure and governance.', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { name: 'Azure Policy for Network Governance', description: 'Azure policy for network governance providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Technology', maturityStageId: 3 },
      { name: 'Automated Network Compliance Monitoring', description: 'Automated network compliance monitoring providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Technology', maturityStageId: 3 },
      { name: 'Network Change Management Process', description: 'Network change management process providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Process', maturityStageId: 3 },
      { name: 'Risk-Based Network Assessments', description: 'Risk-based network assessments providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { name: 'AI-Powered Network Governance', description: 'Ai-powered network governance representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Technology', maturityStageId: 4 },
      { name: 'Continuous Network Compliance Validation', description: 'Continuous network compliance validation representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Technology', maturityStageId: 4 },
      { name: 'Adaptive Network Governance Process', description: 'Adaptive network governance process representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Process', maturityStageId: 4 },
      { name: 'Predictive Network Risk Management', description: 'Predictive network risk management representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Process', maturityStageId: 4 }
    ],

    // Applications & Workloads Pillar - Visibility & Analytics Capability
    'Application Visibility & Analytics': [
      // Traditional (1)
      { name: 'Basic Application Logs', description: 'Simple text-based logging systems for recording application events and errors. Traditional technology providing basic application visibility before implementing structured logging and advanced observability platforms.', type: 'Technology', maturityStageId: 1 },
      { name: 'Manual Log Analysis', description: 'Human-performed review and analysis of application logs for troubleshooting and monitoring. Traditional technology providing manual insights before implementing automated log analysis and intelligent alerting systems.', type: 'Technology', maturityStageId: 1 },
      { name: 'Weekly Application Reviews', description: 'Weekly application reviews providing foundational capabilities before implementing advanced automated solutions.', type: 'Process', maturityStageId: 1 },
      { name: 'Basic Performance Monitoring', description: 'Basic performance monitoring providing foundational capabilities before implementing advanced automated solutions.', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { name: 'Application Performance Monitoring', description: 'Stage application performance monitoring providing enhanced capabilities with improved structure and governance.', type: 'Technology', maturityStageId: 2 },
      { name: 'Centralized Application Logging', description: 'Stage centralized application logging providing enhanced capabilities with improved structure and governance.', type: 'Technology', maturityStageId: 2 },
      { name: 'Application Analytics Dashboard Creation', description: 'Stage application analytics dashboard creation providing enhanced capabilities with improved structure and governance.', type: 'Process', maturityStageId: 2 },
      { name: 'Regular Performance Reporting', description: 'Stage regular performance reporting providing enhanced capabilities with improved structure and governance.', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { name: 'Azure Application Insights', description: 'Azure application insights providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Technology', maturityStageId: 3 },
      { name: 'Application Security Analytics', description: 'Application security analytics providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Technology', maturityStageId: 3 },
      { name: 'Application Security Incident Response', description: 'Application security incident response providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Process', maturityStageId: 3 },
      { name: 'Application Compliance Reporting Process', description: 'Application compliance reporting process providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { name: 'AI-Powered Application Analytics', description: 'Ai-powered application analytics representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Technology', maturityStageId: 4 },
      { name: 'Real-time Application Intelligence', description: 'Real-time application intelligence representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Technology', maturityStageId: 4 },
      { name: 'Predictive Application Analysis', description: 'Predictive application analysis representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Process', maturityStageId: 4 },
      { name: 'Autonomous Application Optimization', description: 'Autonomous application optimization representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Process', maturityStageId: 4 }
    ],

    // Applications & Workloads Pillar - Automation & Orchestration Capability
    'Application Automation & Orchestration': [
      // Traditional (1)
      { name: 'Manual Application Deployment', description: 'Human-performed deployment of applications to servers and infrastructure. Traditional technology requiring manual processes before implementing automated deployment pipelines and container orchestration.', type: 'Technology', maturityStageId: 1 },
      { name: 'Basic Deployment Scripts', description: 'Simple scripts for automating basic application deployment tasks and configuration. Traditional technology providing initial automation before implementing comprehensive CI/CD pipelines and infrastructure as code.', type: 'Technology', maturityStageId: 1 },
      { name: 'Manual Application Scaling', description: 'Manual application scaling providing foundational capabilities before implementing advanced automated solutions.', type: 'Process', maturityStageId: 1 },
      { name: 'Email-Based Deployment Requests', description: 'Email-based deployment requests providing foundational capabilities before implementing advanced automated solutions.', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { name: 'Basic CI/CD Pipelines', description: 'Stage basic ci/cd pipelines providing enhanced capabilities with improved structure and governance.', type: 'Technology', maturityStageId: 2 },
      { name: 'Container Orchestration', description: 'Stage container orchestration providing enhanced capabilities with improved structure and governance.', type: 'Technology', maturityStageId: 2 },
      { name: 'Semi-Automated Deployment Process', description: 'Stage semi-automated deployment process providing enhanced capabilities with improved structure and governance.', type: 'Process', maturityStageId: 2 },
      { name: 'Standardized Release Management', description: 'Stage standardized release management providing enhanced capabilities with improved structure and governance.', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { name: 'Azure DevOps Pipelines', description: 'Azure devops pipelines providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Technology', maturityStageId: 3 },
      { name: 'Kubernetes Orchestration', description: 'Kubernetes orchestration providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Technology', maturityStageId: 3 },
      { name: 'Automated Application Deployment Process', description: 'Automated application deployment process providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Process', maturityStageId: 3 },
      { name: 'Self-Service Application Provisioning', description: 'Self-service application provisioning providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { name: 'GitOps Deployment Automation', description: 'Gitops deployment automation representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Technology', maturityStageId: 4 },
      { name: 'AI-Driven Application Orchestration', description: 'Ai-driven application orchestration representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Technology', maturityStageId: 4 },
      { name: 'Autonomous Application Management', description: 'Autonomous application management representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Process', maturityStageId: 4 },
      { name: 'Intelligent Release Optimization', description: 'Intelligent release optimization representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Process', maturityStageId: 4 }
    ],

    // Applications & Workloads Pillar - Governance Capability
    'Application Governance': [
      // Traditional (1)
      { name: 'Manual Policy Documentation', description: 'Human-created documentation of security policies and compliance requirements for applications. Traditional technology providing basic governance before implementing automated policy management and compliance monitoring.', type: 'Technology', maturityStageId: 1 },
      { name: 'Basic Compliance Tracking', description: 'Basic compliance tracking providing foundational capabilities before implementing advanced automated solutions.', type: 'Technology', maturityStageId: 1 },
      { name: 'Annual Application Audits', description: 'Annual application audits providing foundational capabilities before implementing advanced automated solutions.', type: 'Process', maturityStageId: 1 },
      { name: 'Manual Policy Enforcement', description: 'Manual policy enforcement providing foundational capabilities before implementing advanced automated solutions.', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { name: 'Application Portfolio Management', description: 'Stage application portfolio management providing enhanced capabilities with improved structure and governance.', type: 'Technology', maturityStageId: 2 },
      { name: 'Basic Governance Dashboards', description: 'Stage basic governance dashboards providing enhanced capabilities with improved structure and governance.', type: 'Technology', maturityStageId: 2 },
      { name: 'Application Governance Policy Framework', description: 'Stage application governance policy framework providing enhanced capabilities with improved structure and governance.', type: 'Process', maturityStageId: 2 },
      { name: 'Quarterly Governance Reviews', description: 'Stage quarterly governance reviews providing enhanced capabilities with improved structure and governance.', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { name: 'Azure Policy for Applications', description: 'Azure policy for applications providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Technology', maturityStageId: 3 },
      { name: 'Automated Application Compliance Monitoring', description: 'Automated application compliance monitoring providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Technology', maturityStageId: 3 },
      { name: 'Application Risk Management Process', description: 'Application risk management process providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Process', maturityStageId: 3 },
      { name: 'Application Compliance Audit Procedures', description: 'Application compliance audit procedures providing enterprise-grade capabilities with enhanced automation and comprehensive feature sets.', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { name: 'AI-Powered Application Governance', description: 'Ai-powered application governance representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Technology', maturityStageId: 4 },
      { name: 'Continuous Application Compliance Validation', description: 'Continuous application compliance validation representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Technology', maturityStageId: 4 },
      { name: 'Adaptive Application Governance Process', description: 'Adaptive application governance process representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Process', maturityStageId: 4 },
      { name: 'Predictive Application Risk Management', description: 'Predictive application risk management representing cutting-edge technology with AI-driven automation and the most comprehensive capabilities available.', type: 'Process', maturityStageId: 4 }
    ],
  };

  /**
   * Generates demo data for all functions and capabilities
   * Adds at least 2 technologies and 2 processes for each
   */
  async generateDemoData(): Promise<void> {
    try {
      console.log('Starting demo data generation...');

      // Get all function capabilities
      const functionCapabilities = await this.dataService.getFunctionCapabilities();
      const maturityStages = await this.dataService.getMaturityStages();

      let totalAdded = 0;
      let functionsProcessed = 0;

      for (const fc of functionCapabilities) {
        const demoItems = this.demoData[fc.name];

        if (demoItems && demoItems.length > 0) {
          console.log(`Adding demo data for: ${fc.name} (${demoItems.length} items)`);

          for (const item of demoItems) {
            // Validate maturity stage ID exists
            const maturityStage = maturityStages.find(ms => ms.id === item.maturityStageId);
            if (!maturityStage) {
              console.warn(`Invalid maturity stage ID ${item.maturityStageId} for ${item.name}, using ID 2 (Initial)`);
              item.maturityStageId = 2;
            }

            await this.dataService.addTechnologyProcess(
              item.name,
              item.description,
              item.type,
              fc.id,
              item.maturityStageId
            );
            totalAdded++;
          }
          functionsProcessed++;
        } else {
          console.warn(`No demo data found for function/capability: ${fc.name}`);
        }
      }

      console.log(`Demo data generation completed!`);
      console.log(`- Functions/Capabilities processed: ${functionsProcessed}`);
      console.log(`- Total technologies/processes added: ${totalAdded}`);

    } catch (error) {
      console.error('Error generating demo data:', error);
      throw error;
    }
  }

  /**
   * Generates demo assessment responses based on specified maturity stages for each pillar
   */
  async generateDemoAssessmentResponses(): Promise<void> {
    try {
      console.log('Starting demo assessment response generation...');

      // Define the target maturity stages for each pillar
      const pillarMaturityStages: Record<string, { stage: number, implementation: string }> = {
        'Identity': { stage: 3, implementation: 'mixed' }, // Advanced stage, mixed implementation
        'Devices': { stage: 2, implementation: 'full' },   // Initial stage, fully implemented
        'Networks': { stage: 2, implementation: 'full' },  // Initial stage, fully implemented
        'Applications & Workloads': { stage: 2, implementation: 'full' }, // Initial stage, fully implemented
        'Data': { stage: 1, implementation: 'full' }       // Traditional stage, fully implemented
      };

      // Get all pillars and function capabilities
      const pillars = await this.dataService.getPillars();
      const functionCapabilities = await this.dataService.getFunctionCapabilities();

      // Create a map for quick pillar lookup
      const pillarMap = new Map<number, Pillar>();
      pillars.forEach(pillar => pillarMap.set(pillar.id, pillar));

      let totalResponses = 0;

      // Generate responses for each function capability
      for (const fc of functionCapabilities) {
        const pillar = pillarMap.get(fc.pillar_id);
        if (!pillar) {
          console.warn(`No pillar found for function capability: ${fc.name}`);
          continue;
        }

        const pillarConfig = pillarMaturityStages[pillar.name];
        if (!pillarConfig) {
          console.warn(`No maturity configuration found for pillar: ${pillar.name}`);
          continue;
        }

        console.log(`Generating responses for ${pillar.name} pillar - ${fc.name} (Stage ${pillarConfig.stage}, ${pillarConfig.implementation} implementation)`);

        const responses = await this.createAssessmentResponsesForFunction(fc, pillarConfig);
        totalResponses += responses;
      }

      console.log(`Demo assessment responses generated successfully!`);
      console.log(`- Total responses created: ${totalResponses}`);

    } catch (error) {
      console.error('Error generating demo assessment responses:', error);
      throw error;
    }
  }

  /**
   * Creates assessment responses for a specific function/capability
   */
  private async createAssessmentResponsesForFunction(
    functionCapability: FunctionCapability,
    pillarConfig: { stage: number, implementation: string }
  ): Promise<number> {
    try {
      // Get technologies and processes for this function
      const techProcesses = await this.dataService.getTechnologiesProcessesByFunction(functionCapability.id);

      if (!techProcesses || techProcesses.length === 0) {
        console.warn(`No technologies/processes found for function: ${functionCapability.name}`);
        return 0;
      }

      // Filter items based on the target maturity stage
      const targetItems = techProcesses.filter((tp: TechnologyProcess) => tp.maturity_stage_id <= pillarConfig.stage);

      if (targetItems.length === 0) {
        console.warn(`No suitable items found for function: ${functionCapability.name} at stage ${pillarConfig.stage}`);
        return 0;
      }

      // Select items based on implementation type
      let selectedItems: TechnologyProcess[] = [];

      if (pillarConfig.implementation === 'full') {
        // Select all items at or below the target stage
        selectedItems = targetItems.filter((tp: TechnologyProcess) => tp.maturity_stage_id === pillarConfig.stage);
        // If no items at exact stage, take items from lower stages
        if (selectedItems.length === 0) {
          selectedItems = targetItems.filter((tp: TechnologyProcess) => tp.maturity_stage_id < pillarConfig.stage);
        }
      } else if (pillarConfig.implementation === 'mixed') {
        // For Identity pillar: mix of advanced processes and some initial technologies
        const processes = targetItems.filter((tp: TechnologyProcess) => tp.type === 'Process' && tp.maturity_stage_id === 3);
        const technologies = targetItems.filter((tp: TechnologyProcess) => tp.type === 'Technology' && tp.maturity_stage_id <= 2);

        // Select about 70% of advanced processes and 40% of initial technologies
        const selectedProcesses = processes.slice(0, Math.ceil(processes.length * 0.7));
        const selectedTechnologies = technologies.slice(0, Math.ceil(technologies.length * 0.4));

        selectedItems = [...selectedProcesses, ...selectedTechnologies];
      }

      if (selectedItems.length === 0) {
        return 0;
      }

      // Create assessment responses for each selected item
      let responseCount = 0;
      for (const item of selectedItems) {
        const status: AssessmentStatus = this.determineAssessmentStatus(pillarConfig);
        const notes = this.generateAssessmentNotes(functionCapability.name, item.name, pillarConfig);

        await this.dataService.saveAssessment(item.id, status, notes);
        responseCount++;
      }

      return responseCount;

    } catch (error) {
      console.error(`Error creating assessment responses for ${functionCapability.name}:`, error);
      return 0;
    }
  }

  /**
   * Determines the assessment status based on pillar configuration
   */
  private determineAssessmentStatus(pillarConfig: { stage: number, implementation: string }): AssessmentStatus {
    if (pillarConfig.implementation === 'full') {
      return 'Fully Implemented';
    } else if (pillarConfig.implementation === 'mixed') {
      // For mixed implementation, randomly assign some as fully and some as partially implemented
      return Math.random() > 0.3 ? 'Fully Implemented' : 'Partially Implemented';
    }
    return 'Partially Implemented';
  }

  /**
   * Generates contextual notes for the assessment response
   */
  private generateAssessmentNotes(functionName: string, itemName: string, pillarConfig: { stage: number, implementation: string }): string {
    const stageNames = { 1: 'Traditional', 2: 'Initial', 3: 'Advanced', 4: 'Optimal' };
    const stageName = stageNames[pillarConfig.stage as keyof typeof stageNames];

    if (pillarConfig.implementation === 'mixed') {
      return `Demo assessment for ${itemName} in ${functionName}. Mixed implementation approach with some advanced capabilities in place. Generated automatically for demonstration purposes.`;
    } else {
      return `Demo assessment for ${itemName} in ${functionName}. ${stageName} maturity level with ${pillarConfig.implementation} implementation. Generated automatically for demonstration purposes.`;
    }
  }

  /**
   * Checks if demo data already exists to avoid duplicates
   */
  async isDemoDataAlreadyGenerated(): Promise<boolean> {
    try {
      const allTechProcesses = await this.dataService.getAllTechnologiesProcesses();

      // Check for some signature demo items
      const signatureItems = [
        'Azure Active Directory Multi-Factor Authentication',
        'Microsoft Intune Device Compliance',
        'Azure Virtual Network',
        'Azure Web Application Firewall',
        'Microsoft Purview Data Catalog'
      ];

      const foundSignatureItems = signatureItems.filter(item =>
        allTechProcesses.some(tp => tp.description === item)
      );

      return foundSignatureItems.length >= 3; // If we find 3+ signature items, assume demo data exists
    } catch (error) {
      console.error('Error checking for existing demo data:', error);
      return false;
    }
  }

  /**
   * Gets statistics about demo data that would be generated
   */
  async getDemoDataStatistics(): Promise<{
    functionsWithData: number;
    totalTechnologies: number;
    totalProcesses: number;
    totalItems: number;
  }> {
    const functionCapabilities = await this.dataService.getFunctionCapabilities();

    let functionsWithData = 0;
    let totalTechnologies = 0;
    let totalProcesses = 0;
    let totalItems = 0;

    for (const fc of functionCapabilities) {
      const demoItems = this.demoData[fc.name];
      if (demoItems && demoItems.length > 0) {
        functionsWithData++;
        totalItems += demoItems.length;
        totalTechnologies += demoItems.filter(item => item.type === 'Technology').length;
        totalProcesses += demoItems.filter(item => item.type === 'Process').length;
      }
    }

    return {
      functionsWithData,
      totalTechnologies,
      totalProcesses,
      totalItems
    };
  }

  /**
   * Checks if assessment responses already exist
   */
  async hasExistingAssessmentResponses(): Promise<boolean> {
    try {
      const responses = await this.dataService.getAssessmentResponses();
      return responses && responses.length > 0;
    } catch (error) {
      console.error('Error checking existing assessment responses:', error);
      return false;
    }
  }

  /**
   * Generates both demo data and assessment responses
   */
  async generateCompleteDemoData(includeAssessments = false): Promise<void> {
    console.log('Starting complete demo data generation...');

    // Generate technology/process data
    await this.generateDemoData();

    // Generate assessment responses if requested
    if (includeAssessments) {
      const hasExisting = await this.hasExistingAssessmentResponses();
      if (hasExisting) {
        console.log('Assessment responses already exist. Skipping generation.');
      } else {
        // Add a small delay to ensure technology/process data is available
        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.generateDemoAssessmentResponses();
      }
    }

    console.log('Complete demo data generation finished!');
  }
}
