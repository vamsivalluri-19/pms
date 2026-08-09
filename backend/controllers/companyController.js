import { Company } from '../models/User.js';
import { logAuditEvent } from '../middleware/auditMiddleware.js';

// @desc    Get all companies
// @route   GET /api/companies
// @access  Public / Private
export const getCompanies = async (req, res) => {
  const { status } = req.query;
  let query = {};
  
  if (status) {
    query.verificationStatus = status;
  }

  try {
    const companies = await Company.find(query).populate('user', 'email');
    return res.json({ success: true, count: companies.length, companies });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve companies' });
  }
};

// @desc    Get company by ID
// @route   GET /api/companies/:id
// @access  Public
export const getCompanyById = async (req, res) => {
  try {
    if (req.params.id === 'me') {
      const company = await Company.findOne({ user: req.user._id }).populate('user', 'email');
      if (!company) {
        return res.status(404).json({ success: false, message: 'Company not found' });
      }
      return res.json({ success: true, company });
    }

    const company = await Company.findById(req.params.id).populate('user', 'email');
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    return res.json({ success: true, company });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update company profile
// @route   PUT /api/companies/:id
// @access  Private (Company/Manager/Admin)
export const updateCompanyProfile = async (req, res) => {
  try {
    let company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    // Role check: Recruiters can only modify their own company profile
    if (req.user.role === 'COMPANY' && company.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized profile edit' });
    }

    company = await Company.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    return res.json({ success: true, message: 'Company profile updated', company });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to update company details' });
  }
};

// @desc    Approve or Reject Company Registration
// @route   PUT /api/companies/:id/approve
// @access  Private (Manager/Admin)
export const approveCompany = async (req, res) => {
  const { status } = req.body; // APPROVED, REJECTED, SUSPENDED

  if (!['APPROVED', 'REJECTED', 'SUSPENDED'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid approval status value' });
  }

  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    const oldStatus = company.verificationStatus;
    company.verificationStatus = status;
    await company.save();

    await logAuditEvent(req, {
      action: 'Verify Company Profile',
      entity: 'Company',
      entityId: company._id.toString(),
      oldValue: { status: oldStatus },
      newValue: { status }
    });

    return res.json({ success: true, message: `Company status updated to ${status}`, company });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error updating company status' });
  }
};
