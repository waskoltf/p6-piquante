const Sauce = require('../models/sauce');
const fs = require('fs');

//on cree la sauce
exports.created = (req, res, next) => {
    const sauceObjet = JSON.parse(req.body.sauce);
    const sauce = new Sauce({
        ...sauceObjet,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce
        .save()
        .then((sauce) => {
            res.status(201).json({ sauce });
        })
        .catch((error) => {
            res.status(400).json({
                error: error,
            });
        });
};


// on modifie la sauce
exports.update = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body };
    if (req.file) {
        Sauce.findOne({ _id: req.params.id })
            .then((sauce) => {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.updateOne({ _id: req.params.id }, {...sauceObject, _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Sauce mise à jour!' }); })
                        .catch((error) => { res.status(400).json({ error }); });
                })
            })
            .catch((error) => { res.status(500).json({ error }); });

    } else {
        Sauce.updateOne({ _id: req.params.id }, {...sauceObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Sauce mise à jour!' }))
            .catch((error) => res.status(400).json({ error }));
    }
};
// on affiche une seule sauce grace a son id
exports.singleSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(
            (sauce) => {
                res.status(200).json(sauce);
            }
        ).catch(
            (error) => {
                res.status(400).json({
                    error: error
                });
            }
        );
};
// on affiche les sauces cree
exports.liste = (req, res, next) => {
    Sauce.find().then(
        (sauces) => {
            res.status(200).json(sauces);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};
// on supprime une sauce grace a on id
exports.delete = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce supprimé !' }))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};
// on like la sauce
exports.liked = (req, res, next) => {
    switch (req.body.like) {
        //on verifie si l'utilisateur a liker ou dislike la sauce
        //apres cette action on update la sauce
        case 0:
            Sauce.findOne({ _id: req.params.id })
                .then((sauce) => {
                    if (sauce.usersLiked.find(user => user === req.body.userId)) {
                        Sauce.updateOne({ _id: req.params.id }, {
                                $inc: { likes: -1 },
                                $pull: { usersLiked: req.body.userId },
                                _id: req.params.id
                            })
                            .then(() => { res.status(201).json({ message: 'Merci pour ton like' }); })
                            .catch((error) => { res.status(400).json({ error: error }); });

                    }
                    if (sauce.usersDisliked.find(user => user === req.body.userId)) {
                        Sauce.updateOne({ _id: req.params.id }, {
                                $inc: { dislikes: -1 },
                                $pull: { usersDisliked: req.body.userId },
                                _id: req.params.id
                            })
                            .then(() => { res.status(201).json({ message: 'Ton dislike est pris en compte' }); })
                            .catch((error) => { res.status(400).json({ error: error }); });
                    }
                })
                .catch((error) => { res.status(404).json({ error: error }); });
            break;

        case 1:
            Sauce.updateOne({ _id: req.params.id }, {
                    $inc: { likes: 1 },
                    $push: { usersLiked: req.body.userId },
                    _id: req.params.id
                })
                .then(() => { res.status(201).json({ message: 'Merci pour ton like' }); })
                .catch((error) => { res.status(400).json({ error: error }); });
            break;

        case -1:
            Sauce.updateOne({ _id: req.params.id }, {
                    $inc: { dislikes: 1 },
                    $push: { usersDisliked: req.body.userId },
                    _id: req.params.id
                })
                .then(() => { res.status(201).json({ message: 'Ton dislike a été pris en compte!' }); })
                .catch((error) => { res.status(400).json({ error: error }); });
            break;
        default:
            console.error('not today : mauvaise requête');
    }
};