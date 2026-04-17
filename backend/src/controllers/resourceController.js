const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('express-async-handler');
const Hospital = require('../models/Hospital');
const ResourceRequest = require('../models/ResourceRequest');

const generateResourceRequestId = () => `RR${uuidv4().split('-')[0].substring(0, 6).toUpperCase()}`;

// @desc    Create resource request
// @route   POST /api/resource/request
// @access  Private
const createResourceRequest = asyncHandler(async (req, res) => {
    const { resource_type, quantity, unit, priority, notes } = req.body;
    const hospital_id = req.hospital.hospital_id;

    const rrId = generateResourceRequestId();
    const resourceReq = new ResourceRequest({
        resource_request_id: rrId,
        requesting_hospital_id: hospital_id,
        resource_type,
        quantity,
        unit: unit || 'units',
        priority: priority || 'normal',
        notes: notes || '',
        status: "pending"
    });

    await resourceReq.save();
    res.status(201).json({ resource_request_id: rrId, status: "created", data: resourceReq });
});

// @desc    Respond to resource request
// @route   POST /api/resource/respond
// @access  Private
const respondToResourceRequest = asyncHandler(async (req, res) => {
    const { resource_request_id, response } = req.body;
    const hospital_id = req.hospital.hospital_id;

    const resourceReq = await ResourceRequest.findOne({ resource_request_id });
    if (!resourceReq) {
        res.status(404);
        throw new Error(`Resource request '${resource_request_id}' not found`);
    }

    if (resourceReq.status !== 'pending') {
        res.status(400);
        throw new Error("Resource request is no longer pending");
    }

    if (resourceReq.requesting_hospital_id === hospital_id) {
        res.status(400);
        throw new Error("Network Error: Nodes cannot fulfill their own resource broadcasts");
    }

    if (response === 'accept') {
        resourceReq.status = 'accepted';
        resourceReq.fulfilled_by = hospital_id;

        // Elite Reward: Increase fulfiller trust score
        await Hospital.findOneAndUpdate(
            { hospital_id: hospital_id },
            { $inc: { trust_score: 5 } }
        );
    } else if (response === 'reject') {
        // Logic handled as per original (reject just logs)
    } else {
        res.status(400);
        throw new Error("Response must be 'accept' or 'reject'");
    }

    await resourceReq.save();
    res.json({ status: resourceReq.status });
});

// @desc    Get all resource requests
// @route   GET /api/resource/all
// @access  Private
const getAllResourceRequests = asyncHandler(async (req, res) => {
    const hospital_id = req.hospital.hospital_id;

    // Visibility Logic:
    // 1. All pending requests are visible to everyone.
    // 2. Accepted/Fulfilled requests are only visible to the requester and the fulfiller.
    const allReqs = await ResourceRequest.find({
        $or: [
            { status: 'pending' },
            { requesting_hospital_id: hospital_id },
            { fulfilled_by: hospital_id }
        ]
    }).sort({ createdAt: -1 });

    const entries = allReqs.map(r => ({
        id: r.resource_request_id,
        resource_type: r.resource_type,
        quantity: r.quantity,
        unit: r.unit,
        priority: r.priority,
        notes: r.notes,
        status: r.status,
        requesting_hospital_id: r.requesting_hospital_id,
        fulfilled_by: r.fulfilled_by,
        date: r.createdAt
    }));
    res.json({ requests: entries });
});

// @desc    Get resource sharing stats
// @route   GET /api/resource/stats
// @access  Private
const getResourceStats = asyncHandler(async (req, res) => {
    const hospital_id = req.hospital.hospital_id;

    // How many hospitals have helped YOU (distinct fulfilled_by where you are requester)
    const helpedMe = await ResourceRequest.distinct('fulfilled_by', {
        requesting_hospital_id: hospital_id,
        status: 'accepted',
        fulfilled_by: { $ne: null }
    });

    // How many hospitals YOU have helped (distinct requesting_hospital_id where you are fulfiller)
    const iHelped = await ResourceRequest.distinct('requesting_hospital_id', {
        fulfilled_by: hospital_id,
        status: 'accepted'
    });

    const hospital = await Hospital.findOne({ hospital_id: hospital_id });

    res.json({
        hospitals_asked: helpedMe.length,
        hospitals_helped: iHelped.length,
        trust_score: hospital ? hospital.trust_score : 60
    });
});

// @desc    Cancel resource request
// @route   DELETE /api/resource/cancel/:id
// @access  Private
const cancelResourceRequest = asyncHandler(async (req, res) => {
    const hospital_id = req.hospital.hospital_id;
    const { id } = req.params;

    const resourceReq = await ResourceRequest.findOne({ resource_request_id: id });
    
    if (!resourceReq) {
        res.status(404);
        throw new Error("Resource request not found");
    }

    if (resourceReq.requesting_hospital_id !== hospital_id) {
        res.status(403);
        throw new Error("You are not authorized to cancel this request");
    }

    if (resourceReq.status !== 'pending') {
        res.status(400);
        throw new Error("Only pending requests can be cancelled");
    }

    await ResourceRequest.deleteOne({ resource_request_id: id });
    res.json({ status: "cancelled", message: "Request removed from network" });
});

// @desc    Update logistics status of a fulfilled request
// @route   PUT /api/resource/logistics/:id
// @access  Private
const updateLogisticsStatus = asyncHandler(async (req, res) => {
    const { status } = req.body; // shipped, delivered, completed
    const { id } = req.params;
    const hospital_id = req.hospital.hospital_id;

    const resourceReq = await ResourceRequest.findOne({ resource_request_id: id });
    if (!resourceReq) {
        res.status(404);
        throw new Error("Resource request not found");
    }

    // Only fulfiller or requester can update status depending on the stage
    // Typically the fulfiller handles 'shipped' and the requester handles 'delivered/completed'
    const allowed = [resourceReq.requesting_hospital_id, resourceReq.fulfilled_by].includes(hospital_id);
    if (!allowed) {
        res.status(403);
        throw new Error("Not authorized to update this logistics stream");
    }

    resourceReq.status = status;
    await resourceReq.save();
    res.json({ status: resourceReq.status, message: "Logistics updated" });
});

module.exports = {
    createResourceRequest,
    respondToResourceRequest,
    getAllResourceRequests,
    getResourceStats,
    cancelResourceRequest,
    updateLogisticsStatus
};
