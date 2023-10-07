import AES from 'crypto-js/aes';
import promoRef from '../../../assets/json/promos.json';
import mailVerif from '../../../assets/admin/mailsVerif.json';
import { ExtendedClient } from '../../../structures/Client';
import { ModalSubmitInteraction, Role } from 'discord.js';
import MV from '../../../typings/MongoTypes';

const verification = class Verif {
    mail: string;
    promo: string;
    degree: string;
    city: string;
    interaction: any;
    client: any;

    constructor(
        mail: string,
        interaction: ModalSubmitInteraction,
        client: ExtendedClient
    ) {
        this.mail = mail;
        this.promo;
        this.degree;
        this.city;
        this.interaction = interaction;
        this.client = client;
    }

    async setupMailData(mdata): Promise<string> {
        // All IPSA guilds that you want to auto-assign roles "IPSAlien".
        // Only if your guild contains a role named "IPSAlien"
        let guilds = [
            '880491243807846450',
            '1123290381711311010',
            '984924408529432596',
            '880499115878932571',
            '932333114326405140',
        ];

        // Flatten data structure
        const mailVerifFlattened = {};

        // Loop through each city
        for (let city in mailVerif) {
            // Loop through each degree type
            for (let degreeType in mailVerif[city]) {
                // Add promo years directly to flattened structure
                mailVerifFlattened[`${city}-${degreeType}`] =
                    mailVerif[city][degreeType];
            }
        }

        let mailFound = false;

        // Simple iteration over flattened data
        for (let key in mailVerifFlattened) {
            // Directly access promo years
            const promoDict = mailVerifFlattened[key];

            for (let promoYear of Object.keys(promoDict)) {
                console.log(promoDict[promoYear]);
                // if it's empty, skip
                if (promoDict[promoYear].length === 0) {
                    continue;
                }
                if (promoDict[promoYear].includes(this.mail.toLowerCase())) {
                    // Extract city and degree from key
                    const [city, degree] = key.split('-');
                    this.city = city;
                    this.degree = degree;
                    this.promo = promoYear;
                    mailFound = true;
                    break;
                }
            }

            // Completely break out of loop when found
            if (mailFound) {
                break;
            }
        }

        if (!mailFound) {
            return (
                ':bangbang: Vérification ouverte pour tous sauf **Toulouse** pour le moment.\n' +
                "Il semblerait que tu te sois trompé dans l'écriture de ton mail.\n" +
                "Si tu penses qu'il s'agit d'une erreur provenant du bot je t'invite à mp un responsable discord ou à nous écrire dans le channel <#880491243807846457> ou <#884489030501294160>."
            );
        }

        if (mdata.email === '') {
            if (this.mail) {
                let name = this.mail.substring(0, this.mail.indexOf('@'));
                let firstName = name.substring(0, this.mail.indexOf('.'));
                let surName = name.substring(this.mail.indexOf('.') + 1);
                let correctName =
                    firstName.charAt(0).toUpperCase() + firstName.slice(1);
                let correctSurname = surName.toUpperCase();
                let fullName = correctSurname + ' ' + correctName;

                // ---------------------
                // database registration
                // ---------------------

                mdata.firstName = AES.encrypt(
                    firstName,
                    process.env.AES
                ).toString();
                mdata.secondName = AES.encrypt(
                    surName,
                    process.env.AES
                ).toString();
                mdata.email = AES.encrypt(
                    this.mail.toLowerCase(),
                    process.env.AES
                ).toString();
                console.log(this.promo);

                try {
                    mdata.promo = Number(this.promo);
                } catch (err) {
                    console.log('Issue with promo');
                }

                mdata.degree = this.degree;
                mdata.city = this.city;

                mdata.save();

                console.log(
                    'User registered: ' +
                        this.interaction.user.tag +
                        ' | ' +
                        this.mail +
                        ' | ' +
                        this.promo +
                        ' | ' +
                        this.degree +
                        ' | ' +
                        this.city
                );

                let role: Role;
                let registeredServer = [];

                guilds.forEach((serv, index) => {
                    const check = async () => {
                        new Promise((resolve) => setTimeout(resolve, 2500));

                        let guild = this.client.guilds.cache.get(serv);

                        if (guild) {
                            // get user id
                            let member = guild.members.cache.get(
                                this.interaction.user.id
                            );
                            if (member) {
                                try {
                                    promoRef.forEach((promoData) => {
                                        if (
                                            promoData['promo'].toString() ===
                                            this.promo
                                        ) {
                                            role = guild.roles.cache.find(
                                                (r: Role) =>
                                                    r.name.includes(
                                                        promoData[
                                                            'name'
                                                        ].toString()
                                                    )
                                            );
                                            if (role !== undefined) {
                                                console.log(
                                                    'Role found: ' + role.name
                                                );
                                            }
                                        }
                                    });

                                    try {
                                        role = guild.roles.cache.find((r) =>
                                            r.name.includes('IPSAlien')
                                        );
                                        if (role !== undefined) {
                                            console.log(
                                                'Role found: ' + role.name
                                            );
                                        }
                                    } catch (err) {
                                        console.log(
                                            'User verified but no role found'
                                        );
                                    }
                                } catch (err) {
                                    console.log(err);
                                }

                                new Promise((reject) => {
                                    member.roles.add(role).catch(() => {
                                        return reject(
                                            "Erreur lors de l'ajout du rôle, ouvre un ticket <#884401487395057695>."
                                        );
                                    });
                                });

                                // add server to registedServer
                                let roleTxt = '';
                                if (role !== undefined) {
                                    roleTxt = ` Tu as reçu le rôle **${role.name}**.`;
                                }
                                registeredServer.push(
                                    `> tu es **verifié** sur ***${guild}*** en accord avec notre base de donnée. ${roleTxt} \n`
                                );
                            }
                        }
                    };

                    check();
                });

                let servTxt = '';
                if (promoRef['promo'] !== undefined) {
                    servTxt = `\n\nRejoins également ton serveur de promo si ce n'est pas fait: ${
                        promoRef[this.promo]['discord']
                    }\n A bientôt!`;
                }

                let registeredServerTxt = registeredServer.join('\n');
                return (
                    `***${fullName}*** Tu appartiens à la promo ***${
                        this.promo
                    }***, cycle ***${this.degree.toUpperCase()}*** à ***${this.city.toUpperCase()}*** \n\n` +
                    registeredServerTxt +
                    servTxt
                );
            } else {
                if (!this.mail.lastIndexOf('@ipsa.fr')) {
                    return "Il semblerait que tu te sois trompé dans l'écriture de ton mail. (l'email doit contenir prénom.nom@ipsa.fr)";
                }
            }
        } else {
            console.log(mdata);
            return `Ton compte a déjà été verifié! <:drakeno:630099103220760576> `;
        }
    }

    async checkMail(): Promise<string> {
        let mdata = await MV.findOne({
            discordId: this.interaction.user.id,
        });

        if (!mdata) {
            await new MV({
                discordId: this.interaction.user.id,
                discordTag: this.interaction.user.tag,
                firstName: '',
                secondName: '',
                promo: 1,
                degree: '',
                city: '',
                email: '',
                assoArt: [],
                assoSport: [],
                assoTech: [],
            }).save();
        }

        mdata = await MV.findOne({
            discordId: this.interaction.user.id,
        });

        return this.setupMailData(mdata);
    }

    async startVerif(): Promise<string> {
        try {
            const data = await MV.findOne({
                email: this.mail.toLowerCase(),
            });

            if (data && data.discordId !== this.interaction.user.id) {
                return "Tu ne peux pas prendre l'identité de quelqu'un d'autre Mr Who! Si tu penses qu'il s'agit d'une erreur MP un admin.";
            }

            if (!data) {
                console.log('Checking mail...');
                return this.checkMail();
            }

            return `Ton compte a déjà été verifié! <:drakeno:630099103220760576> `;
        } catch (err) {
            // make error report
            console.log('\n------------------------------');
            console.log('Error in startVerif function');
            console.log(err);
            return 'Une erreur est survenue, ouvre un ticket pour nous en informer.';
        }
    }
};

export { verification };
