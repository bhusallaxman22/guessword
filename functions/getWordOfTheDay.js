const crypto = require("crypto");

const FOUR_LETTER_WORDS = [
    "ABLE", "ACID", "ALSO", "AREA", "ARMY", "AWAY", "BABY", "BACK", "BALL", "BAND", "BANK", "BASE", "BATH", "BEAR", "BEAT", "BEEN",
    "BEER", "BELL", "BELT", "BEND", "BEST", "BIRD", "BLOW", "BLUE", "BOAT", "BODY", "BOMB", "BOND", "BONE", "BOOK", "BOSS", "BOTH",
    "BOWL", "BURN", "BUSH", "BUSY", "CAKE", "CALL", "CALM", "CAME", "CAMP", "CARD", "CARE", "CASE", "CASH", "CAST", "CELL", "CHAT",
    "CHIP", "CITY", "CLUB", "COAL", "COAT", "CODE", "COLD", "COME", "COOK", "COOL", "COPY", "CORE", "CORN", "COST", "CREW", "CROP",
    "DARK", "DATA", "DATE", "DEAL", "DEAR", "DEBT", "DECK", "DEEP", "DEER", "DESK", "DIET", "DIRT", "DISK", "DOES", "DOPE", "DONE", "DOOR",
    "DOWN", "DRAW", "DREAM", "DRESS", "DRUM", "DUCK", "DUST", "DUTY", "EACH", "EARL", "EARN", "EARS", "EASY", "EDGE", "ELSE", "EVEN",
    "EVER", "FACE", "FACT", "FAIL", "FAIR", "FALL", "FARM", "FAST", "FATE", "FEAR", "FEED", "FEEL", "FEET", "FELL", "FELT", "FEW",
    "FILE", "FILL", "FILM", "FIND", "FINE", "FIRE", "FIRM", "FISH", "FIVE", "FLAG", "FLAT", "FLOW", "FOOD", "FOOT", "FORD", "FORE",
    "FORK", "FORM", "FOUR", "FREE", "FROM", "FUEL", "FULL", "FUND", "GAIN", "GAME", "GANG", "GATE", "GAVE", "GEAR", "GENE", "GIFT",
    "GIRL", "GIVE", "GLAD", "GOAL", "GOAT", "GOLD", "GONE", "GOOD", "GRAY", "GREW", "GREY", "GROW", "GULF", "HAIR", "HALF", "HALL",
    "HAND", "HANG", "HARD", "HARM", "HATE", "HAVE", "HEAD", "HEAR", "HEART", "HEAT", "HELD", "HELL", "HELP", "HERE", "HERO", "HIGH",
    "HILL", "HIRE", "HOLD", "HOLE", "HOLY", "HOME", "HOPE", "HOUR", "HUGE", "HUNG", "HUNT", "HURT", "IDEA", "INCH", "INTO", "IRON",
    "ITEM", "JACK", "JAIL", "JOIN", "JOKE", "JUMP", "JURY", "JUST", "KEEN", "KEEP", "KICK", "KILL", "KIND", "KING", "KNEE", "KNEW",
    "KNIT", "KNOT", "KNOW", "LACK", "LADY", "LAID", "LAKE", "LAMB", "LAMP", "LAND", "LANE", "LAST", "LATE", "LAWN", "LEAD", "LEAF",
    "LEAN", "LEFT", "LEND", "LESS", "LIFE", "LIFT", "LIKE", "LINE", "LINK", "LIST", "LIVE", "LOAD", "LOAN", "LOCK", "LONG", "LOOK",
    "LORD", "LOSE", "LOSS", "LOST", "LOUD", "LOVE", "LUCK", "MADE", "MAIL", "MAIN", "MAKE", "MALE", "MANY", "MARK", "MASS", "MEAL",
    "MEAN", "MEAT", "MEET", "MENU", "MILE", "MILK", "MIND", "MINE", "MISS", "MODE", "MOOD", "MOON", "MORE", "MOST", "MOVE", "MUCH",
    "MUST", "NAME", "NAVY", "NEAR", "NECK", "NEED", "NEWS", "NEXT", "NICE", "NINE", "NONE", "NOON", "NOSE", "NOTE", "NOUN", "OARS",
    "OATH", "OBEY", "OPEN", "ORAL", "ORDER", "OTHER", "OURS", "OVER", "PACE", "PACK", "PAGE", "PAID", "PAIN", "PAIR", "PALM", "PARK",
    "PART", "PASS", "PAST", "PATH", "PEAK", "PEAR", "PINK", "PIPE", "PLAN", "PLAY", "PLOT", "PLUS", "POEM", "POET", "POLE", "POLL",
    "POND", "POOL", "POOR", "PORT", "POST", "PULL", "PURE", "PUSH", "QUIT", "QUIZ", "RACE", "RACK", "RAIL", "RAIN", "RANK", "RARE",
    "RATE", "READ", "REAL", "REAR", "RELY", "RENT", "REST", "RICE", "RICH", "RIDE", "RING", "RISE", "RISK", "ROAD", "ROCK", "ROLE",
    "ROLL", "ROOF", "ROOM", "ROOT", "ROPE", "ROSE", "ROW", "RULE", "RUSH", "RUST", "SACK", "SAFE", "SAID", "SAIL", "SALE", "SALT",
    "SAME", "SAND", "SAVE", "SEAT", "SEED", "SEEK", "SEEM", "SELL", "SEND", "SENT", "SHIP", "SHOE", "SHOP", "SHOT", "SHOW", "SICK",
    "SIDE", "SIGN", "SILK", "SING", "SINK", "SIZE", "SKIN", "SLOW", "SNOW", "SOAP", "SOFT", "SOIL", "SOLD", "SOME", "SONG", "SOON",
    "SORT", "SOUL", "SOUP", "SPOT", "STAR", "STAY", "STEP", "STOP", "SUCH", "SUIT", "SURE", "SWIM", "TAIL", "TAKE", "TALK", "TALL",
    "TANK", "TAPE", "TASK", "TAXI", "TEAM", "TEAR", "TELL", "TERM", "TEST", "THAN", "THAT", "THEM", "THEN", "THIN", "THIS", "THUS",
    "TIDE", "TIDY", "TIED", "TIME", "TINY", "TIRE", "TONE", "TOOL", "TOUR", "TOWN", "TREE", "TRIP", "TRUE", "TUBE", "TURN", "TWIN",
    "TYPE", "UNIT", "UPON", "USED", "USER", "VAIN", "VAST", "VERY", "VIEW", "VOTE", "WAIT", "WAKE", "WALK", "WALL", "WANT", "WARM",
    "WARN", "WASH", "WAVE", "WEAK", "WEAR", "WEEK", "WELL", "WENT", "WERE", "WEST", "WHAT", "WHEN", "WHOM", "WIDE", "WIFE", "WILD",
    "WILL", "WIND", "WINE", "WING", "WIRE", "WISE", "WISH", "WITH", "WOOD", "WORD", "WORK", "YARD", "YEAR", "YOUR", "ZERO", "ZONE"
];
exports.handler = async function (event, context) {
    if (event.httpMethod !== "GET") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    // 1) Determine today's word exactly as before:
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-based
    const day = now.getDate();
    const seed = year * 10000 + (month + 1) * 100 + day;
    const idx = seed % FOUR_LETTER_WORDS.length;
    const word = FOUR_LETTER_WORDS[idx].toUpperCase();

    // 2) Load the 32-byte AES key (base64) from env:
    const base64Key = process.env.WORD_SECRET_KEY;
    if (!base64Key) {
        console.error("WORD_SECRET_KEY not set");
        return { statusCode: 500, body: "Server misconfiguration" };
    }
    const key = Buffer.from(base64Key, "base64"); // 32 bytes

    // 3) Generate a random 16-byte IV:
    const iv = crypto.randomBytes(16);

    // 4) Encrypt with AES-256-CBC:
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(word, "utf8");
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // 5) Prepend IV (16 bytes) to ciphertext, then base64 the whole thing:
    const payload = Buffer.concat([iv, encrypted]).toString("base64");

    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: payload }),
    };
};