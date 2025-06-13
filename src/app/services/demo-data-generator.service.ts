import { Injectable } from '@angular/core';
import { ZtmmDataWebService } from './ztmm-data-web.service';

interface DemoTechnologyProcess {
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
  // NOTE: This is demonstration data designed to showcase the assessment tool's capabilities
  // and is not intended to be an all-encompassing list of security technologies and processes
  private readonly demoData: Record<string, DemoTechnologyProcess[]> = {
    // Identity Pillar - Authentication Function
    'Authentication': [
      // Traditional (1)
      { description: 'Basic Username/Password Authentication', type: 'Technology', maturityStageId: 1 },
      { description: 'VPN with Pre-shared Keys', type: 'Technology', maturityStageId: 1 },
      { description: 'Manual Password Reset Process', type: 'Process', maturityStageId: 1 },
      { description: 'Basic User Account Management', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { description: 'Azure Active Directory Basic', type: 'Technology', maturityStageId: 2 },
      { description: 'Single Sign-On (SSO)', type: 'Technology', maturityStageId: 2 },
      { description: 'Multi-Factor Authentication Policy Framework', type: 'Process', maturityStageId: 2 },
      { description: 'Password Complexity Requirements', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { description: 'Azure Active Directory Multi-Factor Authentication', type: 'Technology', maturityStageId: 3 },
      { description: 'Microsoft Authenticator App', type: 'Technology', maturityStageId: 3 },
      { description: 'Passwordless Authentication Rollout Process', type: 'Process', maturityStageId: 3 },
      { description: 'Authentication Risk Assessment Procedures', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { description: 'Azure AD Passwordless Authentication', type: 'Technology', maturityStageId: 4 },
      { description: 'Biometric Authentication Systems', type: 'Technology', maturityStageId: 4 },
      { description: 'Zero-Trust Authentication Framework', type: 'Process', maturityStageId: 4 },
      { description: 'Continuous Authentication Validation', type: 'Process', maturityStageId: 4 }
    ],

    // Identity Pillar - Identity Stores Function
    'Identity Stores': [
      // Traditional (1)
      { description: 'On-Premises Active Directory', type: 'Technology', maturityStageId: 1 },
      { description: 'Local User Account Databases', type: 'Technology', maturityStageId: 1 },
      { description: 'Manual User Provisioning', type: 'Process', maturityStageId: 1 },
      { description: 'Basic Account Lifecycle Management', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { description: 'Azure AD Connect', type: 'Technology', maturityStageId: 2 },
      { description: 'Hybrid Identity Infrastructure', type: 'Technology', maturityStageId: 2 },
      { description: 'Identity Lifecycle Management Process', type: 'Process', maturityStageId: 2 },
      { description: 'Directory Synchronization Procedures', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { description: 'Azure Active Directory Premium', type: 'Technology', maturityStageId: 3 },
      { description: 'Azure AD B2B/B2C', type: 'Technology', maturityStageId: 3 },
      { description: 'Guest User Management Workflow', type: 'Process', maturityStageId: 3 },
      { description: 'Automated Identity Synchronization', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { description: 'Azure AD Cloud-Only Infrastructure', type: 'Technology', maturityStageId: 4 },
      { description: 'Federated Identity Management', type: 'Technology', maturityStageId: 4 },
      { description: 'Self-Service Identity Management', type: 'Process', maturityStageId: 4 },
      { description: 'AI-Driven Identity Analytics', type: 'Process', maturityStageId: 4 }
    ],

    // Identity Pillar - Risk Assessments Function
    'Risk Assessments': [
      // Traditional (1)
      { description: 'Manual Security Audits', type: 'Technology', maturityStageId: 1 },
      { description: 'Basic Logging Systems', type: 'Technology', maturityStageId: 1 },
      { description: 'Periodic Manual Risk Reviews', type: 'Process', maturityStageId: 1 },
      { description: 'Basic Incident Response Procedures', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { description: 'Azure AD Sign-In Logs', type: 'Technology', maturityStageId: 2 },
      { description: 'Basic Risk Detection Tools', type: 'Technology', maturityStageId: 2 },
      { description: 'Identity Risk Assessment Framework', type: 'Process', maturityStageId: 2 },
      { description: 'Regular Access Reviews', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { description: 'Azure AD Identity Protection', type: 'Technology', maturityStageId: 3 },
      { description: 'Azure AD Risk-Based Conditional Access', type: 'Technology', maturityStageId: 3 },
      { description: 'Risk-Based Access Review Process', type: 'Process', maturityStageId: 3 },
      { description: 'Identity Threat Investigation Procedures', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { description: 'Microsoft Defender for Identity', type: 'Technology', maturityStageId: 4 },
      { description: 'AI-Powered Behavioral Analytics', type: 'Technology', maturityStageId: 4 },
      { description: 'Automated Risk Remediation', type: 'Process', maturityStageId: 4 },
      { description: 'Predictive Risk Modeling', type: 'Process', maturityStageId: 4 }
    ],

    // Identity Pillar - Access Management Function
    'Access Management': [
      // Traditional (1)
      { description: 'Manual Access Control Lists', type: 'Technology', maturityStageId: 1 },
      { description: 'Basic File Permissions', type: 'Technology', maturityStageId: 1 },
      { description: 'Manual Access Request Process', type: 'Process', maturityStageId: 1 },
      { description: 'Quarterly Access Reviews', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { description: 'Role-Based Access Control (RBAC)', type: 'Technology', maturityStageId: 2 },
      { description: 'Group-Based Permissions', type: 'Technology', maturityStageId: 2 },
      { description: 'Role-Based Access Control Framework', type: 'Process', maturityStageId: 2 },
      { description: 'Standardized Access Request Workflow', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { description: 'Azure AD Conditional Access', type: 'Technology', maturityStageId: 3 },
      { description: 'Azure AD Access Reviews', type: 'Technology', maturityStageId: 3 },
      { description: 'Privileged Access Management Process', type: 'Process', maturityStageId: 3 },
      { description: 'Regular Access Certification Workflow', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { description: 'Azure AD Privileged Identity Management', type: 'Technology', maturityStageId: 4 },
      { description: 'Zero Standing Privileges', type: 'Technology', maturityStageId: 4 },
      { description: 'Just-In-Time Access Management', type: 'Process', maturityStageId: 4 },
      { description: 'Continuous Access Evaluation', type: 'Process', maturityStageId: 4 }
    ],

    // Identity Pillar - Visibility & Analytics Capability
    'Visibility & Analytics': [
      // Traditional (1)
      { description: 'Basic Event Logs', type: 'Technology', maturityStageId: 1 },
      { description: 'Manual Log Review Tools', type: 'Technology', maturityStageId: 1 },
      { description: 'Weekly Manual Log Reviews', type: 'Process', maturityStageId: 1 },
      { description: 'Basic Incident Documentation', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { description: 'Azure AD Reporting and Analytics', type: 'Technology', maturityStageId: 2 },
      { description: 'Centralized Log Management', type: 'Technology', maturityStageId: 2 },
      { description: 'Identity Analytics Dashboard Creation', type: 'Process', maturityStageId: 2 },
      { description: 'Regular Security Reporting', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { description: 'Azure Monitor for Identity', type: 'Technology', maturityStageId: 3 },
      { description: 'PowerBI for Identity Dashboards', type: 'Technology', maturityStageId: 3 },
      { description: 'Security Incident Response for Identity', type: 'Process', maturityStageId: 3 },
      { description: 'Identity Compliance Reporting Process', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { description: 'Microsoft Sentinel for Identity', type: 'Technology', maturityStageId: 4 },
      { description: 'Real-time Identity Analytics', type: 'Technology', maturityStageId: 4 },
      { description: 'Proactive Threat Hunting', type: 'Process', maturityStageId: 4 },
      { description: 'Automated Incident Response', type: 'Process', maturityStageId: 4 }
    ],

    // Identity Pillar - Automation & Orchestration Capability
    'Automation & Orchestration': [
      // Traditional (1)
      { description: 'Manual Workflow Processes', type: 'Technology', maturityStageId: 1 },
      { description: 'Basic Script Automation', type: 'Technology', maturityStageId: 1 },
      { description: 'Manual Identity Provisioning', type: 'Process', maturityStageId: 1 },
      { description: 'Email-Based Request Processing', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { description: 'PowerShell Automation Scripts', type: 'Technology', maturityStageId: 2 },
      { description: 'Basic Workflow Management', type: 'Technology', maturityStageId: 2 },
      { description: 'Semi-Automated Provisioning Process', type: 'Process', maturityStageId: 2 },
      { description: 'Standardized Request Forms', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { description: 'Azure Logic Apps for Identity Workflows', type: 'Technology', maturityStageId: 3 },
      { description: 'Microsoft Graph API Integration', type: 'Technology', maturityStageId: 3 },
      { description: 'Automated Identity Provisioning Process', type: 'Process', maturityStageId: 3 },
      { description: 'Self-Service Access Request Workflow', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { description: 'Azure AD Entitlement Management', type: 'Technology', maturityStageId: 4 },
      { description: 'AI-Driven Workflow Optimization', type: 'Technology', maturityStageId: 4 },
      { description: 'Automated Compliance Remediation Process', type: 'Process', maturityStageId: 4 },
      { description: 'Intelligent Access Lifecycle Management', type: 'Process', maturityStageId: 4 }
    ],

    // Identity Pillar - Governance Capability
    'Governance': [
      // Traditional (1)
      { description: 'Manual Policy Documentation', type: 'Technology', maturityStageId: 1 },
      { description: 'Basic Compliance Tracking', type: 'Technology', maturityStageId: 1 },
      { description: 'Annual Compliance Audits', type: 'Process', maturityStageId: 1 },
      { description: 'Manual Policy Enforcement', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { description: 'Policy Management Systems', type: 'Technology', maturityStageId: 2 },
      { description: 'Basic Governance Dashboards', type: 'Technology', maturityStageId: 2 },
      { description: 'Identity Governance Policy Framework', type: 'Process', maturityStageId: 2 },
      { description: 'Quarterly Governance Reviews', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { description: 'PowerBI for Identity Governance Reporting', type: 'Technology', maturityStageId: 3 },
      { description: 'Automated Policy Compliance Monitoring', type: 'Technology', maturityStageId: 3 },
      { description: 'Data Access Governance Process', type: 'Process', maturityStageId: 3 },
      { description: 'Identity Compliance Audit Procedures', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { description: 'Azure AD Governance Suite', type: 'Technology', maturityStageId: 4 },
      { description: 'Microsoft Purview Identity Governance', type: 'Technology', maturityStageId: 4 },
      { description: 'Continuous Compliance Monitoring', type: 'Process', maturityStageId: 4 },
      { description: 'AI-Driven Governance Insights', type: 'Process', maturityStageId: 4 }
    ],

    // Devices Pillar - Policy Enforcement & Compliance Monitoring Function
    'Policy Enforcement & Compliance Monitoring': [
      // Traditional (1)
      { description: 'Basic Group Policy Management', type: 'Technology', maturityStageId: 1 },
      { description: 'Manual Device Configuration', type: 'Technology', maturityStageId: 1 },
      { description: 'Manual Compliance Checking', type: 'Process', maturityStageId: 1 },
      { description: 'Basic Device Inventory Management', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { description: 'Azure AD Device Registration', type: 'Technology', maturityStageId: 2 },
      { description: 'Basic Mobile Device Management', type: 'Technology', maturityStageId: 2 },
      { description: 'Device Compliance Policy Framework', type: 'Process', maturityStageId: 2 },
      { description: 'Standard Device Configuration Process', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { description: 'Microsoft Intune Device Compliance', type: 'Technology', maturityStageId: 3 },
      { description: 'Automated Policy Deployment', type: 'Technology', maturityStageId: 3 },
      { description: 'Mobile Device Management Workflow', type: 'Process', maturityStageId: 3 },
      { description: 'Device Security Baseline Implementation', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { description: 'Microsoft Defender for Endpoint', type: 'Technology', maturityStageId: 4 },
      { description: 'Zero-Touch Device Enrollment', type: 'Technology', maturityStageId: 4 },
      { description: 'Continuous Compliance Monitoring', type: 'Process', maturityStageId: 4 },
      { description: 'AI-Driven Device Risk Assessment', type: 'Process', maturityStageId: 4 }
    ],

    // Devices Pillar - Asset & Supply Chain Risk Management Function
    'Asset & Supply Chain Risk Management': [
      // Traditional (1)
      { description: 'Manual Asset Inventory Spreadsheets', type: 'Technology', maturityStageId: 1 },
      { description: 'Basic Asset Tracking Systems', type: 'Technology', maturityStageId: 1 },
      { description: 'Annual Hardware Audits', type: 'Process', maturityStageId: 1 },
      { description: 'Manual Procurement Approval', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { description: 'Microsoft Intune Asset Inventory', type: 'Technology', maturityStageId: 2 },
      { description: 'Centralized Asset Database', type: 'Technology', maturityStageId: 2 },
      { description: 'Hardware Asset Lifecycle Management', type: 'Process', maturityStageId: 2 },
      { description: 'Basic Supply Chain Security Standards', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { description: 'Microsoft Defender Vulnerability Management', type: 'Technology', maturityStageId: 3 },
      { description: 'Azure Resource Graph for Asset Tracking', type: 'Technology', maturityStageId: 3 },
      { description: 'Supply Chain Risk Assessment Process', type: 'Process', maturityStageId: 3 },
      { description: 'Device Security Certification Process', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { description: 'AI-Powered Asset Discovery', type: 'Technology', maturityStageId: 4 },
      { description: 'Supply Chain Intelligence Platform', type: 'Technology', maturityStageId: 4 },
      { description: 'Automated Supply Chain Risk Monitoring', type: 'Process', maturityStageId: 4 },
      { description: 'Predictive Asset Lifecycle Management', type: 'Process', maturityStageId: 4 }
    ],

    // Devices Pillar - Resource Access Function
    'Resource Access': [
      // Traditional (1)
      { description: 'Device-Based Group Membership', type: 'Technology', maturityStageId: 1 },
      { description: 'Manual Device Authentication', type: 'Technology', maturityStageId: 1 },
      { description: 'Basic Device Access Controls', type: 'Process', maturityStageId: 1 },
      { description: 'Manual Device Trust Assessment', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { description: 'Certificate-Based Device Authentication', type: 'Technology', maturityStageId: 2 },
      { description: 'Basic Device Trust Policies', type: 'Technology', maturityStageId: 2 },
      { description: 'Device-Based Access Control Framework', type: 'Process', maturityStageId: 2 },
      { description: 'Standard Device Onboarding Process', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { description: 'Azure AD Device-Based Conditional Access', type: 'Technology', maturityStageId: 3 },
      { description: 'Microsoft Intune App Protection Policies', type: 'Technology', maturityStageId: 3 },
      { description: 'Trusted Device Certification Process', type: 'Process', maturityStageId: 3 },
      { description: 'Remote Access Security Procedures', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { description: 'Windows Hello for Business', type: 'Technology', maturityStageId: 4 },
      { description: 'Zero Trust Device Verification', type: 'Technology', maturityStageId: 4 },
      { description: 'Continuous Device Trust Evaluation', type: 'Process', maturityStageId: 4 },
      { description: 'Adaptive Device Access Controls', type: 'Process', maturityStageId: 4 }
    ],

    // Devices Pillar - Device Threat Protection Function
    'Device Threat Protection': [
      // Traditional (1)
      { description: 'Basic Antivirus Software', type: 'Technology', maturityStageId: 1 },
      { description: 'Manual Malware Scanning', type: 'Technology', maturityStageId: 1 },
      { description: 'Basic Incident Response Procedures', type: 'Process', maturityStageId: 1 },
      { description: 'Manual Threat Investigation', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { description: 'Microsoft Defender SmartScreen', type: 'Technology', maturityStageId: 2 },
      { description: 'Windows Security Center', type: 'Technology', maturityStageId: 2 },
      { description: 'Centralized Threat Monitoring', type: 'Process', maturityStageId: 2 },
      { description: 'Standardized Incident Response', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { description: 'Microsoft Defender for Business', type: 'Technology', maturityStageId: 3 },
      { description: 'Advanced Threat Protection', type: 'Technology', maturityStageId: 3 },
      { description: 'Endpoint Detection and Response Process', type: 'Process', maturityStageId: 3 },
      { description: 'Malware Response and Remediation Workflow', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { description: 'AI-Powered Behavioral Analysis', type: 'Technology', maturityStageId: 4 },
      { description: 'Zero-Day Threat Protection', type: 'Technology', maturityStageId: 4 },
      { description: 'Device Threat Intelligence Integration', type: 'Process', maturityStageId: 4 },
      { description: 'Automated Threat Response and Containment', type: 'Process', maturityStageId: 4 }
    ],

    // Networks Pillar - Network Segmentation Function
    'Network Segmentation': [
      // Traditional (1)
      { description: 'Basic VLANs', type: 'Technology', maturityStageId: 1 },
      { description: 'Physical Network Separation', type: 'Technology', maturityStageId: 1 },
      { description: 'Manual Network Configuration', type: 'Process', maturityStageId: 1 },
      { description: 'Basic Network Documentation', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { description: 'Azure Virtual Network', type: 'Technology', maturityStageId: 2 },
      { description: 'Subnet-Based Segmentation', type: 'Technology', maturityStageId: 2 },
      { description: 'Network Access Control Policy Framework', type: 'Process', maturityStageId: 2 },
      { description: 'Network Topology Planning Process', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { description: 'Azure Network Security Groups', type: 'Technology', maturityStageId: 3 },
      { description: 'Azure Firewall', type: 'Technology', maturityStageId: 3 },
      { description: 'Network Micro-Segmentation Strategy', type: 'Process', maturityStageId: 3 },
      { description: 'Dynamic Network Isolation Procedures', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { description: 'Software-Defined Perimeter (SDP)', type: 'Technology', maturityStageId: 4 },
      { description: 'AI-Driven Network Segmentation', type: 'Technology', maturityStageId: 4 },
      { description: 'Zero Trust Network Architecture Implementation', type: 'Process', maturityStageId: 4 },
      { description: 'Adaptive Network Segmentation Process', type: 'Process', maturityStageId: 4 }
    ],

    // Networks Pillar - Network Traffic Management Function
    'Network Traffic Management': [
      // Traditional (1)
      { description: 'Hardware Load Balancers', type: 'Technology', maturityStageId: 1 },
      { description: 'Basic Network Monitoring Tools', type: 'Technology', maturityStageId: 1 },
      { description: 'Manual Traffic Analysis', type: 'Process', maturityStageId: 1 },
      { description: 'Reactive Bandwidth Management', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { description: 'Azure Load Balancer', type: 'Technology', maturityStageId: 2 },
      { description: 'Basic Quality of Service (QoS)', type: 'Technology', maturityStageId: 2 },
      { description: 'Network Traffic Analysis and Monitoring', type: 'Process', maturityStageId: 2 },
      { description: 'Capacity Planning Process', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { description: 'Azure Traffic Manager', type: 'Technology', maturityStageId: 3 },
      { description: 'Azure Application Gateway', type: 'Technology', maturityStageId: 3 },
      { description: 'Bandwidth Management and QoS Procedures', type: 'Process', maturityStageId: 3 },
      { description: 'DDoS Protection Response Plan', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { description: 'AI-Powered Traffic Optimization', type: 'Technology', maturityStageId: 4 },
      { description: 'Intelligent Load Balancing', type: 'Technology', maturityStageId: 4 },
      { description: 'Predictive Traffic Management', type: 'Process', maturityStageId: 4 },
      { description: 'Automated Performance Optimization', type: 'Process', maturityStageId: 4 }
    ],

    // Networks Pillar - Traffic Encryption Function
    'Traffic Encryption': [
      // Traditional (1)
      { description: 'Basic SSL/TLS', type: 'Technology', maturityStageId: 1 },
      { description: 'Manual Certificate Management', type: 'Technology', maturityStageId: 1 },
      { description: 'Basic Encryption Standards', type: 'Process', maturityStageId: 1 },
      { description: 'Manual Certificate Renewal Process', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { description: 'Azure VPN Gateway', type: 'Technology', maturityStageId: 2 },
      { description: 'Centralized Certificate Management', type: 'Technology', maturityStageId: 2 },
      { description: 'Certificate Lifecycle Management Workflow', type: 'Process', maturityStageId: 2 },
      { description: 'Encryption Policy Framework', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { description: 'Azure ExpressRoute', type: 'Technology', maturityStageId: 3 },
      { description: 'TLS/SSL Certificate Management via Azure Key Vault', type: 'Technology', maturityStageId: 3 },
      { description: 'End-to-End Encryption Implementation Process', type: 'Process', maturityStageId: 3 },
      { description: 'Network Encryption Standards and Compliance', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { description: 'Post-Quantum Cryptography', type: 'Technology', maturityStageId: 4 },
      { description: 'Zero-Trust Network Encryption', type: 'Technology', maturityStageId: 4 },
      { description: 'Adaptive Encryption Management', type: 'Process', maturityStageId: 4 },
      { description: 'Continuous Cryptographic Assessment', type: 'Process', maturityStageId: 4 }
    ],

    // Networks Pillar - Network Resilience Function
    'Network Resilience': [
      // Traditional (1)
      { description: 'Basic Network Redundancy', type: 'Technology', maturityStageId: 1 },
      { description: 'Manual Failover Systems', type: 'Technology', maturityStageId: 1 },
      { description: 'Basic Disaster Recovery Planning', type: 'Process', maturityStageId: 1 },
      { description: 'Manual Network Recovery Procedures', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { description: 'Azure Backup', type: 'Technology', maturityStageId: 2 },
      { description: 'Basic High Availability Configuration', type: 'Technology', maturityStageId: 2 },
      { description: 'Network Disaster Recovery Planning', type: 'Process', maturityStageId: 2 },
      { description: 'Structured Recovery Procedures', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { description: 'Azure Site Recovery', type: 'Technology', maturityStageId: 3 },
      { description: 'Multi-Zone Deployment', type: 'Technology', maturityStageId: 3 },
      { description: 'Business Continuity Testing Procedures', type: 'Process', maturityStageId: 3 },
      { description: 'Network Redundancy Implementation Process', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { description: 'Azure Multi-Region Deployment', type: 'Technology', maturityStageId: 4 },
      { description: 'AI-Driven Resilience Management', type: 'Technology', maturityStageId: 4 },
      { description: 'Automated Disaster Recovery', type: 'Process', maturityStageId: 4 },
      { description: 'Self-Healing Network Architecture', type: 'Process', maturityStageId: 4 }
    ],

    // Applications & Workloads Pillar - Application Access Function
    'Application Access': [
      // Traditional (1)
      { description: 'Basic Authentication Systems', type: 'Technology', maturityStageId: 1 },
      { description: 'Manual Access Control Lists', type: 'Technology', maturityStageId: 1 },
      { description: 'Manual Application Access Management', type: 'Process', maturityStageId: 1 },
      { description: 'Basic User Provisioning Process', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { description: 'Single Sign-On (SSO) Solutions', type: 'Technology', maturityStageId: 2 },
      { description: 'Basic API Management', type: 'Technology', maturityStageId: 2 },
      { description: 'Application Access Review Process', type: 'Process', maturityStageId: 2 },
      { description: 'Standard User Onboarding Workflow', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { description: 'Azure AD Application Proxy', type: 'Technology', maturityStageId: 3 },
      { description: 'Azure API Management', type: 'Technology', maturityStageId: 3 },
      { description: 'API Security Gateway Implementation', type: 'Process', maturityStageId: 3 },
      { description: 'Single Sign-On Deployment Workflow', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { description: 'Microsoft Entra Application Governance', type: 'Technology', maturityStageId: 4 },
      { description: 'Zero Trust Application Access', type: 'Technology', maturityStageId: 4 },
      { description: 'Adaptive Application Access Controls', type: 'Process', maturityStageId: 4 },
      { description: 'AI-Driven Access Optimization', type: 'Process', maturityStageId: 4 }
    ],

    // Applications & Workloads Pillar - Application Threat Protections Function
    'Application Threat Protections': [
      // Traditional (1)
      { description: 'Basic Antivirus for Applications', type: 'Technology', maturityStageId: 1 },
      { description: 'Manual Security Scanning', type: 'Technology', maturityStageId: 1 },
      { description: 'Basic Incident Response for Apps', type: 'Process', maturityStageId: 1 },
      { description: 'Manual Threat Assessment', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { description: 'Web Application Firewalls', type: 'Technology', maturityStageId: 2 },
      { description: 'Basic Application Monitoring', type: 'Technology', maturityStageId: 2 },
      { description: 'Application Security Monitoring Process', type: 'Process', maturityStageId: 2 },
      { description: 'Standard Vulnerability Management', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { description: 'Azure Web Application Firewall', type: 'Technology', maturityStageId: 3 },
      { description: 'Azure DDoS Protection', type: 'Technology', maturityStageId: 3 },
      { description: 'Application Security Threat Modeling', type: 'Process', maturityStageId: 3 },
      { description: 'Security Incident Response for Applications', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { description: 'Microsoft Defender for Cloud Apps', type: 'Technology', maturityStageId: 4 },
      { description: 'AI-Powered Application Protection', type: 'Technology', maturityStageId: 4 },
      { description: 'Runtime Application Self-Protection Implementation', type: 'Process', maturityStageId: 4 },
      { description: 'Autonomous Threat Response', type: 'Process', maturityStageId: 4 }
    ],

    // Applications & Workloads Pillar - Accessible Applications Function
    'Accessible Applications': [
      // Traditional (1)
      { description: 'Basic Web Servers', type: 'Technology', maturityStageId: 1 },
      { description: 'Static File Hosting', type: 'Technology', maturityStageId: 1 },
      { description: 'Manual Application Deployment', type: 'Process', maturityStageId: 1 },
      { description: 'Basic Accessibility Compliance', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { description: 'Azure App Service', type: 'Technology', maturityStageId: 2 },
      { description: 'Load Balanced Applications', type: 'Technology', maturityStageId: 2 },
      { description: 'Application Accessibility Standards Implementation', type: 'Process', maturityStageId: 2 },
      { description: 'Standard Deployment Procedures', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { description: 'Azure Functions', type: 'Technology', maturityStageId: 3 },
      { description: 'Azure Container Instances', type: 'Technology', maturityStageId: 3 },
      { description: 'Multi-Platform Application Deployment Process', type: 'Process', maturityStageId: 3 },
      { description: 'Progressive Web App Development Workflow', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { description: 'Serverless Computing Platforms', type: 'Technology', maturityStageId: 4 },
      { description: 'Micro-Frontend Architecture', type: 'Technology', maturityStageId: 4 },
      { description: 'AI-Driven Application Optimization', type: 'Process', maturityStageId: 4 },
      { description: 'Adaptive User Experience Process', type: 'Process', maturityStageId: 4 }
    ],

    // Applications & Workloads Pillar - Secure Application Development & Deployment Workflow Function
    'Secure Application Development & Deployment Workflow': [
      // Traditional (1)
      { description: 'Manual Code Reviews', type: 'Technology', maturityStageId: 1 },
      { description: 'Basic Version Control', type: 'Technology', maturityStageId: 1 },
      { description: 'Manual Security Testing', type: 'Process', maturityStageId: 1 },
      { description: 'Basic Change Management', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { description: 'Git with Basic CI/CD', type: 'Technology', maturityStageId: 2 },
      { description: 'Automated Build Systems', type: 'Technology', maturityStageId: 2 },
      { description: 'Code Review Process', type: 'Process', maturityStageId: 2 },
      { description: 'Basic Security Integration', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { description: 'Azure DevOps Security Integration', type: 'Technology', maturityStageId: 3 },
      { description: 'Azure Container Registry Security Scanning', type: 'Technology', maturityStageId: 3 },
      { description: 'Secure Software Development Lifecycle Process', type: 'Process', maturityStageId: 3 },
      { description: 'Security Code Review and Approval Workflow', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { description: 'GitHub Advanced Security', type: 'Technology', maturityStageId: 4 },
      { description: 'AI-Powered Security Analysis', type: 'Technology', maturityStageId: 4 },
      { description: 'DevSecOps Pipeline Implementation', type: 'Process', maturityStageId: 4 },
      { description: 'Autonomous Security Validation', type: 'Process', maturityStageId: 4 }
    ],

    // Applications & Workloads Pillar - Application Security Testing Function
    'Application Security Testing': [
      // Traditional (1)
      { description: 'Manual Penetration Testing', type: 'Technology', maturityStageId: 1 },
      { description: 'Basic Vulnerability Scanners', type: 'Technology', maturityStageId: 1 },
      { description: 'Annual Security Assessments', type: 'Process', maturityStageId: 1 },
      { description: 'Manual Vulnerability Management', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { description: 'Automated Vulnerability Scanners', type: 'Technology', maturityStageId: 2 },
      { description: 'Basic Static Analysis Tools', type: 'Technology', maturityStageId: 2 },
      { description: 'Regular Security Testing Schedule', type: 'Process', maturityStageId: 2 },
      { description: 'Vulnerability Tracking Process', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { description: 'Azure Security Center for Applications', type: 'Technology', maturityStageId: 3 },
      { description: 'Static Application Security Testing (SAST) Tools', type: 'Technology', maturityStageId: 3 },
      { description: 'Dynamic Application Security Testing (DAST) Tools', type: 'Technology', maturityStageId: 3 },
      { description: 'Automated Security Testing Integration Process', type: 'Process', maturityStageId: 3 },
      { description: 'Vulnerability Management for Applications Process', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { description: 'AI-Powered Security Testing', type: 'Technology', maturityStageId: 4 },
      { description: 'Interactive Application Security Testing (IAST)', type: 'Technology', maturityStageId: 4 },
      { description: 'Penetration Testing Coordination Workflow', type: 'Process', maturityStageId: 4 },
      { description: 'Continuous Security Validation', type: 'Process', maturityStageId: 4 }
    ],

    // Data Pillar - Data Inventory Function
    'Data Inventory': [
      // Traditional (1)
      { description: 'Manual Data Inventories', type: 'Technology', maturityStageId: 1 },
      { description: 'Spreadsheet-Based Data Tracking', type: 'Technology', maturityStageId: 1 },
      { description: 'Annual Data Discovery Exercises', type: 'Process', maturityStageId: 1 },
      { description: 'Manual Data Documentation', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { description: 'Basic Data Discovery Tools', type: 'Technology', maturityStageId: 2 },
      { description: 'Simple Data Cataloging Systems', type: 'Technology', maturityStageId: 2 },
      { description: 'Data Asset Discovery and Cataloging Process', type: 'Process', maturityStageId: 2 },
      { description: 'Structured Data Documentation Process', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { description: 'Azure Data Factory Data Lineage', type: 'Technology', maturityStageId: 3 },
      { description: 'Microsoft 365 Data Classification', type: 'Technology', maturityStageId: 3 },
      { description: 'Data Ownership Assignment Workflow', type: 'Process', maturityStageId: 3 },
      { description: 'Data Quality Assessment Procedures', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { description: 'Microsoft Purview Data Catalog', type: 'Technology', maturityStageId: 4 },
      { description: 'AI-Powered Data Discovery', type: 'Technology', maturityStageId: 4 },
      { description: 'Autonomous Data Cataloging Process', type: 'Process', maturityStageId: 4 },
      { description: 'Intelligent Data Lineage Tracking', type: 'Process', maturityStageId: 4 }
    ],

    // Data Pillar - Data Categorization Function
    'Data Categorization': [
      // Traditional (1)
      { description: 'Manual Data Classification', type: 'Technology', maturityStageId: 1 },
      { description: 'Basic File Naming Conventions', type: 'Technology', maturityStageId: 1 },
      { description: 'Manual Data Labeling Process', type: 'Process', maturityStageId: 1 },
      { description: 'Basic Data Handling Procedures', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { description: 'Basic Data Classification Tools', type: 'Technology', maturityStageId: 2 },
      { description: 'Standard Data Labels', type: 'Technology', maturityStageId: 2 },
      { description: 'Data Classification Policy Framework', type: 'Process', maturityStageId: 2 },
      { description: 'Structured Data Handling Process', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { description: 'Azure Information Protection', type: 'Technology', maturityStageId: 3 },
      { description: 'Microsoft 365 Sensitivity Labels', type: 'Technology', maturityStageId: 3 },
      { description: 'Automated Data Labeling Workflow', type: 'Process', maturityStageId: 3 },
      { description: 'Data Handling Standards Implementation', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { description: 'Microsoft Purview Data Classification', type: 'Technology', maturityStageId: 4 },
      { description: 'AI-Powered Data Classification', type: 'Technology', maturityStageId: 4 },
      { description: 'Intelligent Data Categorization Process', type: 'Process', maturityStageId: 4 },
      { description: 'Adaptive Data Classification Rules', type: 'Process', maturityStageId: 4 }
    ],

    // Data Pillar - Data Availability Function
    'Data Availability': [
      // Traditional (1)
      { description: 'Basic File Backups', type: 'Technology', maturityStageId: 1 },
      { description: 'Manual Data Recovery Systems', type: 'Technology', maturityStageId: 1 },
      { description: 'Weekly Manual Backups', type: 'Process', maturityStageId: 1 },
      { description: 'Basic Disaster Recovery Planning', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { description: 'Azure Backup and Restore Services', type: 'Technology', maturityStageId: 2 },
      { description: 'Basic Database Replication', type: 'Technology', maturityStageId: 2 },
      { description: 'Data Backup and Recovery Planning', type: 'Process', maturityStageId: 2 },
      { description: 'Scheduled Data Backup Process', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { description: 'Azure SQL Database High Availability', type: 'Technology', maturityStageId: 3 },
      { description: 'Multi-Zone Data Replication', type: 'Technology', maturityStageId: 3 },
      { description: 'Business Continuity for Data Services', type: 'Process', maturityStageId: 3 },
      { description: 'Data Replication and Synchronization Process', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { description: 'Azure Cosmos DB Global Distribution', type: 'Technology', maturityStageId: 4 },
      { description: 'AI-Driven Data Availability Management', type: 'Technology', maturityStageId: 4 },
      { description: 'Autonomous Data Recovery Process', type: 'Process', maturityStageId: 4 },
      { description: 'Predictive Data Availability Monitoring', type: 'Process', maturityStageId: 4 }
    ],

    // Data Pillar - Data Access Function
    'Data Access': [
      // Traditional (1)
      { description: 'Basic File Permissions', type: 'Technology', maturityStageId: 1 },
      { description: 'Manual Access Control Lists', type: 'Technology', maturityStageId: 1 },
      { description: 'Manual Data Access Approval', type: 'Process', maturityStageId: 1 },
      { description: 'Basic Data Access Logging', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { description: 'Role-Based Data Access Control', type: 'Technology', maturityStageId: 2 },
      { description: 'Basic Data Access Monitoring', type: 'Technology', maturityStageId: 2 },
      { description: 'Data Access Control Policy Framework', type: 'Process', maturityStageId: 2 },
      { description: 'Regular Data Access Reviews', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { description: 'Azure Role-Based Access Control for Data', type: 'Technology', maturityStageId: 3 },
      { description: 'Azure Data Loss Prevention', type: 'Technology', maturityStageId: 3 },
      { description: 'Data Access Request and Approval Workflow', type: 'Process', maturityStageId: 3 },
      { description: 'Data Access Monitoring and Auditing Process', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { description: 'Azure Privileged Identity Management for Data', type: 'Technology', maturityStageId: 4 },
      { description: 'AI-Powered Data Access Analytics', type: 'Technology', maturityStageId: 4 },
      { description: 'Zero Trust Data Access Framework', type: 'Process', maturityStageId: 4 },
      { description: 'Continuous Data Access Evaluation', type: 'Process', maturityStageId: 4 }
    ],

    // Data Pillar - Data Encryption Function
    'Data Encryption': [
      // Traditional (1)
      { description: 'Basic Password Protection', type: 'Technology', maturityStageId: 1 },
      { description: 'Manual File Encryption', type: 'Technology', maturityStageId: 1 },
      { description: 'Basic Encryption Standards', type: 'Process', maturityStageId: 1 },
      { description: 'Manual Key Management', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { description: 'Azure Disk Encryption', type: 'Technology', maturityStageId: 2 },
      { description: 'Azure Storage Service Encryption', type: 'Technology', maturityStageId: 2 },
      { description: 'Data Encryption Standards Implementation', type: 'Process', maturityStageId: 2 },
      { description: 'Basic Key Lifecycle Management', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { description: 'Azure Key Vault', type: 'Technology', maturityStageId: 3 },
      { description: 'Database-Level Encryption', type: 'Technology', maturityStageId: 3 },
      { description: 'Encryption Key Management Process', type: 'Process', maturityStageId: 3 },
      { description: 'Automated Key Rotation Procedures', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { description: 'Customer-Managed Keys (CMK)', type: 'Technology', maturityStageId: 4 },
      { description: 'Zero-Knowledge Encryption', type: 'Technology', maturityStageId: 4 },
      { description: 'Customer-Managed Key Rotation Workflow', type: 'Process', maturityStageId: 4 },
      { description: 'AI-Driven Encryption Optimization', type: 'Process', maturityStageId: 4 }
    ],

    // Data Pillar - Visibility & Analytics Capability
    'Data Visibility & Analytics': [
      // Traditional (1)
      { description: 'Basic Database Reports', type: 'Technology', maturityStageId: 1 },
      { description: 'Manual Data Analysis', type: 'Technology', maturityStageId: 1 },
      { description: 'Weekly Data Usage Reports', type: 'Process', maturityStageId: 1 },
      { description: 'Basic Data Quality Checks', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { description: 'Business Intelligence Tools', type: 'Technology', maturityStageId: 2 },
      { description: 'Centralized Data Logging', type: 'Technology', maturityStageId: 2 },
      { description: 'Data Analytics Dashboard Creation', type: 'Process', maturityStageId: 2 },
      { description: 'Regular Data Performance Reporting', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { description: 'Azure Synapse Analytics', type: 'Technology', maturityStageId: 3 },
      { description: 'Power BI for Data Visualization', type: 'Technology', maturityStageId: 3 },
      { description: 'Data Security Incident Response', type: 'Process', maturityStageId: 3 },
      { description: 'Data Compliance Reporting Process', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { description: 'AI-Powered Data Analytics', type: 'Technology', maturityStageId: 4 },
      { description: 'Real-time Data Intelligence', type: 'Technology', maturityStageId: 4 },
      { description: 'Predictive Data Analysis', type: 'Process', maturityStageId: 4 },
      { description: 'Autonomous Data Optimization', type: 'Process', maturityStageId: 4 }
    ],

    // Data Pillar - Automation & Orchestration Capability
    'Data Automation & Orchestration': [
      // Traditional (1)
      { description: 'Manual Data Processing', type: 'Technology', maturityStageId: 1 },
      { description: 'Basic Data Scripts', type: 'Technology', maturityStageId: 1 },
      { description: 'Manual Data Pipeline Management', type: 'Process', maturityStageId: 1 },
      { description: 'Email-Based Data Requests', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { description: 'Basic ETL Tools', type: 'Technology', maturityStageId: 2 },
      { description: 'Scheduled Data Processing', type: 'Technology', maturityStageId: 2 },
      { description: 'Semi-Automated Data Pipeline Process', type: 'Process', maturityStageId: 2 },
      { description: 'Standardized Data Request Workflow', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { description: 'Azure Data Factory', type: 'Technology', maturityStageId: 3 },
      { description: 'Azure Logic Apps for Data Workflows', type: 'Technology', maturityStageId: 3 },
      { description: 'Automated Data Pipeline Deployment', type: 'Process', maturityStageId: 3 },
      { description: 'Self-Service Data Provisioning', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { description: 'AI-Driven Data Orchestration', type: 'Technology', maturityStageId: 4 },
      { description: 'Intelligent Data Processing', type: 'Technology', maturityStageId: 4 },
      { description: 'Autonomous Data Management', type: 'Process', maturityStageId: 4 },
      { description: 'Adaptive Data Processing Optimization', type: 'Process', maturityStageId: 4 }
    ],

    // Data Pillar - Governance Capability
    'Data Governance': [
      // Traditional (1)
      { description: 'Manual Data Policy Documentation', type: 'Technology', maturityStageId: 1 },
      { description: 'Basic Data Compliance Tracking', type: 'Technology', maturityStageId: 1 },
      { description: 'Annual Data Audits', type: 'Process', maturityStageId: 1 },
      { description: 'Manual Data Policy Enforcement', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { description: 'Data Governance Platforms', type: 'Technology', maturityStageId: 2 },
      { description: 'Basic Data Governance Dashboards', type: 'Technology', maturityStageId: 2 },
      { description: 'Data Governance Policy Framework', type: 'Process', maturityStageId: 2 },
      { description: 'Quarterly Data Governance Reviews', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { description: 'Microsoft Purview for Data Governance', type: 'Technology', maturityStageId: 3 },
      { description: 'Automated Data Compliance Monitoring', type: 'Technology', maturityStageId: 3 },
      { description: 'Data Risk Management Process', type: 'Process', maturityStageId: 3 },
      { description: 'Data Compliance Audit Procedures', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { description: 'AI-Powered Data Governance', type: 'Technology', maturityStageId: 4 },
      { description: 'Continuous Data Compliance Validation', type: 'Technology', maturityStageId: 4 },
      { description: 'Adaptive Data Governance Process', type: 'Process', maturityStageId: 4 },
      { description: 'Predictive Data Risk Management', type: 'Process', maturityStageId: 4 }
    ],

    // Networks Pillar - Visibility & Analytics Capability
    'Network Visibility & Analytics': [
      // Traditional (1)
      { description: 'Basic Network Monitoring Tools', type: 'Technology', maturityStageId: 1 },
      { description: 'Simple Network Analyzers', type: 'Technology', maturityStageId: 1 },
      { description: 'Manual Network Traffic Analysis', type: 'Process', maturityStageId: 1 },
      { description: 'Weekly Network Performance Reviews', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { description: 'Azure Network Watcher', type: 'Technology', maturityStageId: 2 },
      { description: 'Centralized Network Logging', type: 'Technology', maturityStageId: 2 },
      { description: 'Network Performance Monitoring Process', type: 'Process', maturityStageId: 2 },
      { description: 'Regular Network Security Assessments', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { description: 'Azure Monitor for Networks', type: 'Technology', maturityStageId: 3 },
      { description: 'Network Traffic Analytics', type: 'Technology', maturityStageId: 3 },
      { description: 'Proactive Network Threat Detection', type: 'Process', maturityStageId: 3 },
      { description: 'Network Compliance Reporting Process', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { description: 'AI-Powered Network Analytics', type: 'Technology', maturityStageId: 4 },
      { description: 'Real-time Network Intelligence', type: 'Technology', maturityStageId: 4 },
      { description: 'Predictive Network Analysis', type: 'Process', maturityStageId: 4 },
      { description: 'Automated Network Anomaly Response', type: 'Process', maturityStageId: 4 }
    ],

    // Networks Pillar - Automation & Orchestration Capability
    'Network Automation & Orchestration': [
      // Traditional (1)
      { description: 'Manual Network Configuration', type: 'Technology', maturityStageId: 1 },
      { description: 'Basic Scripting Tools', type: 'Technology', maturityStageId: 1 },
      { description: 'Manual Network Provisioning', type: 'Process', maturityStageId: 1 },
      { description: 'Email-Based Change Requests', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { description: 'PowerShell for Network Automation', type: 'Technology', maturityStageId: 2 },
      { description: 'Azure Resource Manager Templates', type: 'Technology', maturityStageId: 2 },
      { description: 'Semi-Automated Network Deployment', type: 'Process', maturityStageId: 2 },
      { description: 'Standardized Configuration Management', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { description: 'Azure Logic Apps for Network Workflows', type: 'Technology', maturityStageId: 3 },
      { description: 'Terraform for Infrastructure as Code', type: 'Technology', maturityStageId: 3 },
      { description: 'Automated Network Provisioning Process', type: 'Process', maturityStageId: 3 },
      { description: 'Self-Service Network Request Workflow', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { description: 'AI-Driven Network Orchestration', type: 'Technology', maturityStageId: 4 },
      { description: 'Intent-Based Networking', type: 'Technology', maturityStageId: 4 },
      { description: 'Autonomous Network Management', type: 'Process', maturityStageId: 4 },
      { description: 'Intelligent Network Optimization', type: 'Process', maturityStageId: 4 }
    ],

    // Networks Pillar - Governance Capability
    'Network Governance': [
      // Traditional (1)
      { description: 'Manual Network Documentation', type: 'Technology', maturityStageId: 1 },
      { description: 'Basic Network Inventory Systems', type: 'Technology', maturityStageId: 1 },
      { description: 'Annual Network Audits', type: 'Process', maturityStageId: 1 },
      { description: 'Manual Policy Enforcement', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { description: 'Network Configuration Management Database', type: 'Technology', maturityStageId: 2 },
      { description: 'Basic Network Governance Dashboards', type: 'Technology', maturityStageId: 2 },
      { description: 'Network Governance Policy Framework', type: 'Process', maturityStageId: 2 },
      { description: 'Quarterly Network Compliance Reviews', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { description: 'Azure Policy for Network Governance', type: 'Technology', maturityStageId: 3 },
      { description: 'Automated Network Compliance Monitoring', type: 'Technology', maturityStageId: 3 },
      { description: 'Network Change Management Process', type: 'Process', maturityStageId: 3 },
      { description: 'Risk-Based Network Assessments', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { description: 'AI-Powered Network Governance', type: 'Technology', maturityStageId: 4 },
      { description: 'Continuous Network Compliance Validation', type: 'Technology', maturityStageId: 4 },
      { description: 'Adaptive Network Governance Process', type: 'Process', maturityStageId: 4 },
      { description: 'Predictive Network Risk Management', type: 'Process', maturityStageId: 4 }
    ],

    // Applications & Workloads Pillar - Visibility & Analytics Capability
    'Application Visibility & Analytics': [
      // Traditional (1)
      { description: 'Basic Application Logs', type: 'Technology', maturityStageId: 1 },
      { description: 'Manual Log Analysis', type: 'Technology', maturityStageId: 1 },
      { description: 'Weekly Application Reviews', type: 'Process', maturityStageId: 1 },
      { description: 'Basic Performance Monitoring', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { description: 'Application Performance Monitoring', type: 'Technology', maturityStageId: 2 },
      { description: 'Centralized Application Logging', type: 'Technology', maturityStageId: 2 },
      { description: 'Application Analytics Dashboard Creation', type: 'Process', maturityStageId: 2 },
      { description: 'Regular Performance Reporting', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { description: 'Azure Application Insights', type: 'Technology', maturityStageId: 3 },
      { description: 'Application Security Analytics', type: 'Technology', maturityStageId: 3 },
      { description: 'Application Security Incident Response', type: 'Process', maturityStageId: 3 },
      { description: 'Application Compliance Reporting Process', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { description: 'AI-Powered Application Analytics', type: 'Technology', maturityStageId: 4 },
      { description: 'Real-time Application Intelligence', type: 'Technology', maturityStageId: 4 },
      { description: 'Predictive Application Analysis', type: 'Process', maturityStageId: 4 },
      { description: 'Autonomous Application Optimization', type: 'Process', maturityStageId: 4 }
    ],

    // Applications & Workloads Pillar - Automation & Orchestration Capability
    'Application Automation & Orchestration': [
      // Traditional (1)
      { description: 'Manual Application Deployment', type: 'Technology', maturityStageId: 1 },
      { description: 'Basic Deployment Scripts', type: 'Technology', maturityStageId: 1 },
      { description: 'Manual Application Scaling', type: 'Process', maturityStageId: 1 },
      { description: 'Email-Based Deployment Requests', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { description: 'Basic CI/CD Pipelines', type: 'Technology', maturityStageId: 2 },
      { description: 'Container Orchestration', type: 'Technology', maturityStageId: 2 },
      { description: 'Semi-Automated Deployment Process', type: 'Process', maturityStageId: 2 },
      { description: 'Standardized Release Management', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { description: 'Azure DevOps Pipelines', type: 'Technology', maturityStageId: 3 },
      { description: 'Kubernetes Orchestration', type: 'Technology', maturityStageId: 3 },
      { description: 'Automated Application Deployment Process', type: 'Process', maturityStageId: 3 },
      { description: 'Self-Service Application Provisioning', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { description: 'GitOps Deployment Automation', type: 'Technology', maturityStageId: 4 },
      { description: 'AI-Driven Application Orchestration', type: 'Technology', maturityStageId: 4 },
      { description: 'Autonomous Application Management', type: 'Process', maturityStageId: 4 },
      { description: 'Intelligent Release Optimization', type: 'Process', maturityStageId: 4 }
    ],

    // Applications & Workloads Pillar - Governance Capability
    'Application Governance': [
      // Traditional (1)
      { description: 'Manual Policy Documentation', type: 'Technology', maturityStageId: 1 },
      { description: 'Basic Compliance Tracking', type: 'Technology', maturityStageId: 1 },
      { description: 'Annual Application Audits', type: 'Process', maturityStageId: 1 },
      { description: 'Manual Policy Enforcement', type: 'Process', maturityStageId: 1 },

      // Initial (2)
      { description: 'Application Portfolio Management', type: 'Technology', maturityStageId: 2 },
      { description: 'Basic Governance Dashboards', type: 'Technology', maturityStageId: 2 },
      { description: 'Application Governance Policy Framework', type: 'Process', maturityStageId: 2 },
      { description: 'Quarterly Governance Reviews', type: 'Process', maturityStageId: 2 },

      // Advanced (3)
      { description: 'Azure Policy for Applications', type: 'Technology', maturityStageId: 3 },
      { description: 'Automated Application Compliance Monitoring', type: 'Technology', maturityStageId: 3 },
      { description: 'Application Risk Management Process', type: 'Process', maturityStageId: 3 },
      { description: 'Application Compliance Audit Procedures', type: 'Process', maturityStageId: 3 },

      // Optimal (4)
      { description: 'AI-Powered Application Governance', type: 'Technology', maturityStageId: 4 },
      { description: 'Continuous Application Compliance Validation', type: 'Technology', maturityStageId: 4 },
      { description: 'Adaptive Application Governance Process', type: 'Process', maturityStageId: 4 },
      { description: 'Predictive Application Risk Management', type: 'Process', maturityStageId: 4 }
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
              console.warn(`Invalid maturity stage ID ${item.maturityStageId} for ${item.description}, using ID 2 (Initial)`);
              item.maturityStageId = 2;
            }

            await this.dataService.addTechnologyProcess(
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
}
