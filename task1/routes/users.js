const express = require('express');
const router = express.Router();
const { body, query, check, param, validationResult } = require('express-validator');

const db = require('../models');

// Create a new user
router.post(
    '/users',
    [
        body('firstName').notEmpty().isString(),
        body('lastName').notEmpty().isString(),
        body('email').notEmpty().isEmail(),
        body('mobileNumber')
            .notEmpty()
            .isNumeric()
            .isLength({ min: 10, max: 10 }),
        body('birthdate').optional({ nullable: true }).isISO8601(),

        // Validate addresses array
        body('addresses')
            .isArray()
            .notEmpty()
            .custom((value) => {
                if (!Array.isArray(value) || value.length === 0) {
                    throw new Error('Addresses must be provided as an array with at least one address');
                }
                return true;
            }),
        body('addresses.*.addressLine1').notEmpty().isString(),
        body('addresses.*.pincode')
            .notEmpty()
            .isNumeric()
            .isLength({ min: 4, max: 6 }),
        body('addresses.*.city').notEmpty().isString(),
        body('addresses.*.state').notEmpty().isString(),
        body('addresses.*.type').notEmpty().isIn(['Home', 'Office']),

        // Check for duplicate email and mobile number
        body('email')
            .notEmpty()
            .isEmail()
            .custom(async (value) => {
                const user = await db.User.findOne({ where: { email: value } });
                if (user) {
                    throw new Error('Email is already in use');
                }
                return true;
            }),
        body('mobileNumber')
            .notEmpty()
            .isNumeric()
            .isLength({ min: 10, max: 10 })
            .custom(async (value) => {
                const user = await db.User.findOne({ where: { mobileNumber: value } });
                if (user) {
                    throw new Error('Mobile number is already in use');
                }
                return true;
            }),
    ],
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        const { firstName, lastName, email, mobileNumber, birthdate, addresses } = req.body;

        try {
            // Create the user
            const user = await db.User.create({
                firstName,
                lastName,
                email,
                mobileNumber,
                birthdate,
            });

            // Create user's addresses
            await Promise.all(
                addresses.map(async (addressData) => {
                    await db.Address.create({
                        UserId: user.id,
                        ...addressData,
                    });
                })
            );

            res.status(201).json(user);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
);

// Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await db.User.findAll({ include: db.Address });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get user by ID
router.get(
    '/users/:id',
    [param('id').isNumeric()],
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        const { id } = req.params;

        try {
            const user = await db.User.findByPk(id, { include: db.Address });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json(user);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
);

// Update a user by ID
router.put(
    '/users/:id',
    [
        param('id').isNumeric(),
        body('firstName').optional({ nullable: true }).isString(),
        body('lastName').optional({ nullable: true }).isString(),
        body('email').optional({ nullable: true }).isEmail(),
        body('mobileNumber')
            .optional({ nullable: true })
            .isNumeric()
            .isLength({ min: 10, max: 10 }),
        body('birthdate').optional({ nullable: true }).isISO8601(),

        // Validate addresses array
        body('addresses')
            .isArray()
            .notEmpty()
            .custom((value) => {
                if (!Array.isArray(value) || value.length === 0) {
                    throw new Error('Addresses must be provided as an array with at least one address');
                }
                return true;
            }),
        body('addresses.*.addressLine1').optional({ nullable: true }).isString(),
        body('addresses.*.pincode')
            .optional({ nullable: true })
            .isNumeric()
            .isLength({ min: 4, max: 6 }),
        body('addresses.*.city').optional({ nullable: true }).isString(),
        body('addresses.*.state').optional({ nullable: true }).isString(),
        body('addresses.*.type').optional({ nullable: true }).isIn(['Home', 'Office']),

        // Check for duplicate email and mobile number
        body('email')
            .optional({ nullable: true })
            .isEmail()
            .custom(async (value, { req }) => {
                const user = await db.User.findOne({
                    where: { email: value, id: { [db.Sequelize.Op.not]: req.params.id } },
                });
                if (user) {
                    throw new Error('Email is already in use');
                }
                return true;
            }),
        body('mobileNumber')
            .optional({ nullable: true })
            .isNumeric()
            .isLength({ min: 10, max: 10 })
            .custom(async (value, { req }) => {
                const user = await db.User.findOne({
                    where: { mobileNumber: value, id: { [db.Sequelize.Op.not]: req.params.id } },
                });
                if (user) {
                    throw new Error('Mobile number is already in use');
                }
                return true;
            }),
    ],
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const updatedUserData = req.body;

        try {
            const user = await db.User.findByPk(id, { include: db.Address });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Update the user data here
            await user.update(updatedUserData);

            // Update user's addresses
            if (updatedUserData.addresses) {
                await Promise.all(
                    updatedUserData.addresses.map(async (addressData, index) => {
                        if (user.Addresses[index]) {
                            await user.Addresses[index].update(addressData);
                        } else {
                            await db.Address.create({
                                UserId: user.id,
                                ...addressData,
                            });
                        }
                    })
                );
            }

            res.json(user);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
);

// Delete a user by ID
router.delete(
    '/users/:id',
    [param('id').isNumeric()],
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        const { id } = req.params;

        try {
            const user = await db.User.findByPk(id, { include: db.Address });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Delete the user's addresses first
            await db.Address.destroy({ where: { UserId: id } });

            // Then delete the user
            await user.destroy();

            res.status(204).send();
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
);

// Search users
router.get(
    '/user/search',
    [
        // Validation for query parameters
        check('nameOrEmail').optional().isString(),
        check('minAge').optional().isInt(),
        check('maxAge').optional().isInt(),
        check('city').optional().isString(),
    ],
    async (req, res) => {
        // Check for validation errors in query parameters
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        try {
            const { nameOrEmail, minAge, maxAge, city } = req.query;
            const filterOptions = {};

            if (nameOrEmail) {
                filterOptions[db.Sequelize.Op.or] = [
                    { firstName: { [db.Sequelize.Op.like]: `%${nameOrEmail}%` } },
                    { lastName: { [db.Sequelize.Op.like]: `%${nameOrEmail}%` } },
                    { email: { [db.Sequelize.Op.like]: `%${nameOrEmail}%` } },
                ];
            }

            if (minAge) {
                filterOptions.birthdate = {
                    [db.Sequelize.Op.lte]: new Date(new Date().getFullYear() - minAge, 0, 1),
                };
            }
            if (maxAge) {
                filterOptions.birthdate = {
                    [db.Sequelize.Op.gte]: new Date(new Date().getFullYear() - maxAge - 1, 11, 31),
                };
            }

            if (city) {
                filterOptions['$Addresses.city$'] = { [db.Sequelize.Op.like]: `%${city}%` };
            }

            const users = await db.User.findAll({
                where: filterOptions,
                include: db.Address,
            });

            res.json(users);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
);

module.exports = router;
