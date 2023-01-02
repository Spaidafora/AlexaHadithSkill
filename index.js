const Alexa = require("ask-sdk");
const https = require("https");

const getHadith = function() {
    return new Promise((resolve, reject) => {
        https.get("https://www.hadithapi.com/api/hadiths/?apiKey={$2y$10$1wi5m51h5WJuxkV95jozouDCqh6cUZwMmG2fFoo20Gf7CxvyGPAqq", (res) => {
            res.on("data", (d) => {
                const hadith = JSON.parse(d).data[0].text;
                resolve(hadith);
            });
        }).on("error", (e) => {
            reject(e);
        });
    });
}

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "LaunchRequest";
    },
    async handle(handlerInput) {
        const speechText = "Welcome to Hadith of the day. Would you like to hear a hadith?";

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const HadithIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
            && handlerInput.requestEnvelope.request.intent.name === "HadithIntent";
    },
    async handle(handlerInput) {
        try {
            const speechText = await getHadith();

            return handlerInput.responseBuilder
                .speak(speechText)
                .withSimpleCard("Hadith of the Day", speechText)
                .getResponse();
        } catch (error) {
            console.log(error);
            return handlerInput.responseBuilder
                .speak("An error occurred while getting the hadith. Please try again later.")
                .getResponse();
        }
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type && handlerInput.requestEnvelope.request.intent.name === "AMAZON.HelpIntent";
    },
    handle(handlerInput) {
        const speechText = "You can say give me a hadith to hear a hadith of the day";

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard("Hadith of the Day", speechText)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
            && (handlerInput.requestEnvelope.request.intent.name === "AMAZON.CancelIntent"
                || handlerInput.requestEnvelope.request.intent.name === "AMAZON.StopIntent");
    },
    handle(handlerInput) {
        const speechText = "Goodbye!";

        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard("Hadith of the Day", speechText)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "SessionEndedRequest";
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);

        return handlerInput.responseBuilder
            .speak("Sorry, I can't understand the command. Please say again.")
            .reprompt("Sorry, I can't understand the command. Please say again.")
            .getResponse();
    }
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
    .addRequestHandlers(
        LaunchRequestHandler,
        HadithIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();