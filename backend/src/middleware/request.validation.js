const Joi = require('joi');

const requestSchema = Joi.object({
    type: Joi.string().required(),
    price: Joi.number().min(0).required(),
    office_id: Joi.number().integer().allow(null),
    status: Joi.string().valid('draft', 'pending', 'validated', 'processing', 'to_deliver', 'completed', 'cancelled').default('pending'),
    details: Joi.alternatives().try(
        Joi.string(),
        Joi.object()
    ).required()
});

const validateRequest = (req, res, next) => {
    const { error } = requestSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: 'error',
            message: 'Données de demande invalides',
            details: error.details.map(d => d.message)
        });
    }
    next();
};

module.exports = { validateRequest };
