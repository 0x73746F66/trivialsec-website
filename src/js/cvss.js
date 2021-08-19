class CVSSv3_1 {
    CVSSVersionIdentifier = "CVSS:3.1"
    exploitabilityCoefficient = 8.22
    scopeCoefficient = 1.08
    vectorStringRegex_31 = /^CVSS:3\.1\/((AV:[NALP]|AC:[LH]|PR:[UNLH]|UI:[NR]|S:[UC]|[CIA]:[NLH]|E:[XUPFH]|RL:[XOTWU]|RC:[XURC]|[CIA]R:[XLMH]|MAV:[XNALP]|MAC:[XLH]|MPR:[XUNLH]|MUI:[XNR]|MS:[XUC]|M[CIA]:[XNLH])\/)*(AV:[NALP]|AC:[LH]|PR:[UNLH]|UI:[NR]|S:[UC]|[CIA]:[NLH]|E:[XUPFH]|RL:[XOTWU]|RC:[XURC]|[CIA]R:[XLMH]|MAV:[XNALP]|MAC:[XLH]|MPR:[XUNLH]|MUI:[XNR]|MS:[XUC]|M[CIA]:[XNLH])$/
    Weight = {
        AV: {
            N: 0.85,
            A: 0.62,
            L: 0.55,
            P: 0.2
        },
        AC: {
            H: 0.44,
            L: 0.77
        },
        PR: {
            U: {
                N: 0.85,
                L: 0.62,
                H: 0.27
            },
            C: {
                N: 0.85,
                L: 0.68,
                H: 0.5
            }
        },
        UI: {
            N: 0.85,
            R: 0.62
        },
        S: {
            U: 6.42,
            C: 7.52
        },
        CIA: {
            N: 0,
            L: 0.22,
            H: 0.56
        },
        E: {
            X: 1,
            U: 0.91,
            P: 0.94,
            F: 0.97,
            H: 1
        },
        RL: {
            X: 1,
            O: 0.95,
            T: 0.96,
            W: 0.97,
            U: 1
        },
        RC: {
            X: 1,
            U: 0.92,
            R: 0.96,
            C: 1
        },
        CIAR: {
            X: 1,
            L: 0.5,
            M: 1,
            H: 1.5
        }
    }
    severityRatings = [{
        name: "None",
        bottom: 0.0,
        top: 0.0
    }, {
        name: "Low",
        bottom: 0.1,
        top: 3.9
    }, {
        name: "Medium",
        bottom: 4.0,
        top: 6.9
    }, {
        name: "High",
        bottom: 7.0,
        top: 8.9
    }, {
        name: "Critical",
        bottom: 9.0,
        top: 10.0
    }]
    XML_MetricNames = {
        E: {
            X: "NOT_DEFINED",
            U: "UNPROVEN",
            P: "PROOF_OF_CONCEPT",
            F: "FUNCTIONAL",
            H: "HIGH"
        },
        RL: {
            X: "NOT_DEFINED",
            O: "OFFICIAL_FIX",
            T: "TEMPORARY_FIX",
            W: "WORKAROUND",
            U: "UNAVAILABLE"
        },
        RC: {
            X: "NOT_DEFINED",
            U: "UNKNOWN",
            R: "REASONABLE",
            C: "CONFIRMED"
        },
        CIAR: {
            X: "NOT_DEFINED",
            L: "LOW",
            M: "MEDIUM",
            H: "HIGH"
        },
        MAV: {
            N: "NETWORK",
            A: "ADJACENT_NETWORK",
            L: "LOCAL",
            P: "PHYSICAL",
            X: "NOT_DEFINED"
        },
        MAC: {
            H: "HIGH",
            L: "LOW",
            X: "NOT_DEFINED"
        },
        MPR: {
            N: "NONE",
            L: "LOW",
            H: "HIGH",
            X: "NOT_DEFINED"
        },
        MUI: {
            N: "NONE",
            R: "REQUIRED",
            X: "NOT_DEFINED"
        },
        MS: {
            U: "UNCHANGED",
            C: "CHANGED",
            X: "NOT_DEFINED"
        },
        MCIA: {
            N: "NONE",
            L: "LOW",
            H: "HIGH",
            X: "NOT_DEFINED"
        }
    }
    constructor(vector) {
        this.vector = vector
    }
    static roundUp1(input) {
        let int_input = Math.round(input * 100000);
        if (int_input % 10000 === 0) {
            return int_input / 100000
        } else {
            return (Math.floor(int_input / 10000) + 1) / 10
        }
    }
    calculateCVSSFromMetrics(AttackVector, AttackComplexity, PrivilegesRequired, UserInteraction, Scope, Confidentiality, Integrity, Availability, ExploitCodeMaturity, RemediationLevel, ReportConfidence, ConfidentialityRequirement, IntegrityRequirement, AvailabilityRequirement, ModifiedAttackVector, ModifiedAttackComplexity, ModifiedPrivilegesRequired, ModifiedUserInteraction, ModifiedScope, ModifiedConfidentiality, ModifiedIntegrity, ModifiedAvailability) {
        let badMetrics = [];
        if (typeof AttackVector === "undefined" || AttackVector === "") {
            badMetrics.push("AV")
        }
        if (typeof AttackComplexity === "undefined" || AttackComplexity === "") {
            badMetrics.push("AC")
        }
        if (typeof PrivilegesRequired === "undefined" || PrivilegesRequired === "") {
            badMetrics.push("PR")
        }
        if (typeof UserInteraction === "undefined" || UserInteraction === "") {
            badMetrics.push("UI")
        }
        if (typeof Scope === "undefined" || Scope === "") {
            badMetrics.push("S")
        }
        if (typeof Confidentiality === "undefined" || Confidentiality === "") {
            badMetrics.push("C")
        }
        if (typeof Integrity === "undefined" || Integrity === "") {
            badMetrics.push("I")
        }
        if (typeof Availability === "undefined" || Availability === "") {
            badMetrics.push("A")
        }
        if (badMetrics.length > 0) {
            return {
                success: false,
                errorType: "MissingBaseMetric",
                errorMetrics: badMetrics
            }
        }
        let AV = AttackVector;
        let AC = AttackComplexity;
        let PR = PrivilegesRequired;
        let UI = UserInteraction;
        let S = Scope;
        let C = Confidentiality;
        let I = Integrity;
        let A = Availability;
        let E = ExploitCodeMaturity || "X";
        let RL = RemediationLevel || "X";
        let RC = ReportConfidence || "X";
        let CR = ConfidentialityRequirement || "X";
        let IR = IntegrityRequirement || "X";
        let AR = AvailabilityRequirement || "X";
        let MAV = ModifiedAttackVector || "X";
        let MAC = ModifiedAttackComplexity || "X";
        let MPR = ModifiedPrivilegesRequired || "X";
        let MUI = ModifiedUserInteraction || "X";
        let MS = ModifiedScope || "X";
        let MC = ModifiedConfidentiality || "X";
        let MI = ModifiedIntegrity || "X";
        let MA = ModifiedAvailability || "X";
        if (!this.Weight.AV.hasOwnProperty(AV)) {
            badMetrics.push("AV")
        }
        if (!this.Weight.AC.hasOwnProperty(AC)) {
            badMetrics.push("AC")
        }
        if (!this.Weight.PR.U.hasOwnProperty(PR)) {
            badMetrics.push("PR")
        }
        if (!this.Weight.UI.hasOwnProperty(UI)) {
            badMetrics.push("UI")
        }
        if (!this.Weight.S.hasOwnProperty(S)) {
            badMetrics.push("S")
        }
        if (!this.Weight.CIA.hasOwnProperty(C)) {
            badMetrics.push("C")
        }
        if (!this.Weight.CIA.hasOwnProperty(I)) {
            badMetrics.push("I")
        }
        if (!this.Weight.CIA.hasOwnProperty(A)) {
            badMetrics.push("A")
        }
        if (!this.Weight.E.hasOwnProperty(E)) {
            badMetrics.push("E")
        }
        if (!this.Weight.RL.hasOwnProperty(RL)) {
            badMetrics.push("RL")
        }
        if (!this.Weight.RC.hasOwnProperty(RC)) {
            badMetrics.push("RC")
        }
        if (!(CR === "X" || this.Weight.CIAR.hasOwnProperty(CR))) {
            badMetrics.push("CR")
        }
        if (!(IR === "X" || this.Weight.CIAR.hasOwnProperty(IR))) {
            badMetrics.push("IR")
        }
        if (!(AR === "X" || this.Weight.CIAR.hasOwnProperty(AR))) {
            badMetrics.push("AR")
        }
        if (!(MAV === "X" || this.Weight.AV.hasOwnProperty(MAV))) {
            badMetrics.push("MAV")
        }
        if (!(MAC === "X" || this.Weight.AC.hasOwnProperty(MAC))) {
            badMetrics.push("MAC")
        }
        if (!(MPR === "X" || this.Weight.PR.U.hasOwnProperty(MPR))) {
            badMetrics.push("MPR")
        }
        if (!(MUI === "X" || this.Weight.UI.hasOwnProperty(MUI))) {
            badMetrics.push("MUI")
        }
        if (!(MS === "X" || this.Weight.S.hasOwnProperty(MS))) {
            badMetrics.push("MS")
        }
        if (!(MC === "X" || this.Weight.CIA.hasOwnProperty(MC))) {
            badMetrics.push("MC")
        }
        if (!(MI === "X" || this.Weight.CIA.hasOwnProperty(MI))) {
            badMetrics.push("MI")
        }
        if (!(MA === "X" || this.Weight.CIA.hasOwnProperty(MA))) {
            badMetrics.push("MA")
        }
        if (badMetrics.length > 0) {
            return {
                success: false,
                errorType: "UnknownMetricValue",
                errorMetrics: badMetrics
            }
        }
        let metricWeightAV = this.Weight.AV[AV];
        let metricWeightAC = this.Weight.AC[AC];
        let metricWeightPR = this.Weight.PR[S][PR];
        let metricWeightUI = this.Weight.UI[UI];
        let metricWeightS = this.Weight.S[S];
        let metricWeightC = this.Weight.CIA[C];
        let metricWeightI = this.Weight.CIA[I];
        let metricWeightA = this.Weight.CIA[A];
        let metricWeightE = this.Weight.E[E];
        let metricWeightRL = this.Weight.RL[RL];
        let metricWeightRC = this.Weight.RC[RC];
        let metricWeightCR = this.Weight.CIAR[CR];
        let metricWeightIR = this.Weight.CIAR[IR];
        let metricWeightAR = this.Weight.CIAR[AR];
        let metricWeightMAV = this.Weight.AV[MAV !== "X" ? MAV : AV];
        let metricWeightMAC = this.Weight.AC[MAC !== "X" ? MAC : AC];
        let metricWeightMPR = this.Weight.PR[MS !== "X" ? MS : S][MPR !== "X" ? MPR : PR];
        let metricWeightMUI = this.Weight.UI[MUI !== "X" ? MUI : UI];
        let metricWeightMS = this.Weight.S[MS !== "X" ? MS : S];
        let metricWeightMC = this.Weight.CIA[MC !== "X" ? MC : C];
        let metricWeightMI = this.Weight.CIA[MI !== "X" ? MI : I];
        let metricWeightMA = this.Weight.CIA[MA !== "X" ? MA : A];
        let iss;
        let impact;
        let exploitability;
        let baseScore;
        iss = (1 - ((1 - metricWeightC) * (1 - metricWeightI) * (1 - metricWeightA)));
        if (S === 'U') {
            impact = metricWeightS * iss
        } else {
            impact = metricWeightS * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15)
        }
        exploitability = this.exploitabilityCoefficient * metricWeightAV * metricWeightAC * metricWeightPR * metricWeightUI;
        if (impact <= 0) {
            baseScore = 0
        } else {
            if (S === 'U') {
                baseScore = CVSSv3_1.roundUp1(Math.min((exploitability + impact), 10))
            } else {
                baseScore = CVSSv3_1.roundUp1(Math.min(this.scopeCoefficient * (exploitability + impact), 10))
            }
        }
        let temporalScore = CVSSv3_1.roundUp1(baseScore * metricWeightE * metricWeightRL * metricWeightRC);
        let miss;
        let modifiedImpact;
        let envScore;
        let modifiedExploitability;
        miss = Math.min(1 - ((1 - metricWeightMC * metricWeightCR) * (1 - metricWeightMI * metricWeightIR) * (1 - metricWeightMA * metricWeightAR)), 0.915);
        if (MS === "U" || (MS === "X" && S === "U")) {
            modifiedImpact = metricWeightMS * miss
        } else {
            modifiedImpact = metricWeightMS * (miss - 0.029) - 3.25 * Math.pow(miss * 0.9731 - 0.02, 13)
        }
        modifiedExploitability = this.exploitabilityCoefficient * metricWeightMAV * metricWeightMAC * metricWeightMPR * metricWeightMUI;
        if (modifiedImpact <= 0) {
            envScore = 0
        } else if (MS === "U" || (MS === "X" && S === "U")) {
            envScore = CVSSv3_1.roundUp1(CVSSv3_1.roundUp1(Math.min((modifiedImpact + modifiedExploitability), 10)) * metricWeightE * metricWeightRL * metricWeightRC)
        } else {
            envScore = CVSSv3_1.roundUp1(CVSSv3_1.roundUp1(Math.min(this.scopeCoefficient * (modifiedImpact + modifiedExploitability), 10)) * metricWeightE * metricWeightRL * metricWeightRC)
        }
        let vectorString = this.CVSSVersionIdentifier + "/AV:" + AV + "/AC:" + AC + "/PR:" + PR + "/UI:" + UI + "/S:" + S + "/C:" + C + "/I:" + I + "/A:" + A;
        if (E !== "X") {
            vectorString = vectorString + "/E:" + E
        }
        if (RL !== "X") {
            vectorString = vectorString + "/RL:" + RL
        }
        if (RC !== "X") {
            vectorString = vectorString + "/RC:" + RC
        }
        if (CR !== "X") {
            vectorString = vectorString + "/CR:" + CR
        }
        if (IR !== "X") {
            vectorString = vectorString + "/IR:" + IR
        }
        if (AR !== "X") {
            vectorString = vectorString + "/AR:" + AR
        }
        if (MAV !== "X") {
            vectorString = vectorString + "/MAV:" + MAV
        }
        if (MAC !== "X") {
            vectorString = vectorString + "/MAC:" + MAC
        }
        if (MPR !== "X") {
            vectorString = vectorString + "/MPR:" + MPR
        }
        if (MUI !== "X") {
            vectorString = vectorString + "/MUI:" + MUI
        }
        if (MS !== "X") {
            vectorString = vectorString + "/MS:" + MS
        }
        if (MC !== "X") {
            vectorString = vectorString + "/MC:" + MC
        }
        if (MI !== "X") {
            vectorString = vectorString + "/MI:" + MI
        }
        if (MA !== "X") {
            vectorString = vectorString + "/MA:" + MA
        }
        const result = {
            success: true,
            baseMetricScore: baseScore.toFixed(1),
            baseSeverity: this.severityRating(baseScore.toFixed(1)),
            baseISS: iss,
            baseImpact: impact,
            baseExploitability: exploitability,
            temporalMetricScore: temporalScore.toFixed(1),
            temporalSeverity: this.severityRating(temporalScore.toFixed(1)),
            environmentalMetricScore: envScore.toFixed(1),
            environmentalSeverity: this.severityRating(envScore.toFixed(1)),
            environmentalMISS: miss,
            environmentalModifiedImpact: modifiedImpact,
            environmentalModifiedExploitability: modifiedExploitability,
            vectorString: vectorString
        }
        this.baseMetricScore = result.baseMetricScore
        this.baseSeverity = result.baseSeverity
        this.baseISS = result.baseISS
        this.baseImpact = result.baseImpact
        this.baseExploitability = result.baseExploitability
        this.temporalMetricScore = result.temporalMetricScore
        this.temporalSeverity = result.temporalSeverity
        this.environmentalMetricScore = result.environmentalMetricScore
        this.environmentalSeverity = result.environmentalSeverity
        this.environmentalMISS = result.environmentalMISS
        this.environmentalModifiedImpact = result.environmentalModifiedImpact
        this.environmentalModifiedExploitability = result.environmentalModifiedExploitability
        return result
    }
    calculateCVSSFromVector(vectorString) {
        vectorString ??= this.vector
        let metricValues = {
            AV: undefined,
            AC: undefined,
            PR: undefined,
            UI: undefined,
            S: undefined,
            C: undefined,
            I: undefined,
            A: undefined,
            E: undefined,
            RL: undefined,
            RC: undefined,
            CR: undefined,
            IR: undefined,
            AR: undefined,
            MAV: undefined,
            MAC: undefined,
            MPR: undefined,
            MUI: undefined,
            MS: undefined,
            MC: undefined,
            MI: undefined,
            MA: undefined
        };
        let badMetrics = [];
        if (!this.vectorStringRegex_31.test(vectorString)) {
            return {
                success: false,
                errorType: "MalformedVectorString"
            }
        }
        let metricNameValue = vectorString.substring(this.CVSSVersionIdentifier.length).split("/");
        for (let i in metricNameValue) {
            if (metricNameValue.hasOwnProperty(i)) {
                let singleMetric = metricNameValue[i].split(":");
                if (typeof metricValues[singleMetric[0]] === "undefined") {
                    metricValues[singleMetric[0]] = singleMetric[1]
                } else {
                    badMetrics.push(singleMetric[0])
                }
            }
        }
        if (badMetrics.length > 0) {
            return {
                success: false,
                errorType: "MultipleDefinitionsOfMetric",
                errorMetrics: badMetrics
            }
        }
        return this.calculateCVSSFromMetrics(metricValues.AV, metricValues.AC, metricValues.PR, metricValues.UI, metricValues.S, metricValues.C, metricValues.I, metricValues.A, metricValues.E, metricValues.RL, metricValues.RC, metricValues.CR, metricValues.IR, metricValues.AR, metricValues.MAV, metricValues.MAC, metricValues.MPR, metricValues.MUI, metricValues.MS, metricValues.MC, metricValues.MI, metricValues.MA)
    }
    severityRating(score) {
        let severityRatingLength = this.severityRatings.length;
        let validatedScore = Number(score);
        if (isNaN(validatedScore)) {
            return validatedScore
        }
        for (let i = 0; i < severityRatingLength; i++) {
            if (score >= this.severityRatings[i].bottom && score <= this.severityRatings[i].top) {
                return this.severityRatings[i].name
            }
        }
        return undefined
    }
    generateXMLFromMetrics(AttackVector, AttackComplexity, PrivilegesRequired, UserInteraction, Scope, Confidentiality, Integrity, Availability, ExploitCodeMaturity, RemediationLevel, ReportConfidence, ConfidentialityRequirement, IntegrityRequirement, AvailabilityRequirement, ModifiedAttackVector, ModifiedAttackComplexity, ModifiedPrivilegesRequired, ModifiedUserInteraction, ModifiedScope, ModifiedConfidentiality, ModifiedIntegrity, ModifiedAvailability) {
        let xmlTemplate = '<?xml version="1.0" encoding="UTF-8"?>\n' + '<cvssv3.1 xmlns="https://www.first.org/cvss/cvss-v3.1.xsd"\n' + '  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n' + '  xsi:schemaLocation="https://www.first.org/cvss/cvss-v3.1.xsd https://www.first.org/cvss/cvss-v3.1.xsd"\n' + '  >\n' + '\n' + '  <base_metrics>\n' + '    <attack-vector>__AttackVector__</attack-vector>\n' + '    <attack-complexity>__AttackComplexity__</attack-complexity>\n' + '    <privileges-required>__PrivilegesRequired__</privileges-required>\n' + '    <user-interaction>__UserInteraction__</user-interaction>\n' + '    <scope>__Scope__</scope>\n' + '    <confidentiality-impact>__Confidentiality__</confidentiality-impact>\n' + '    <integrity-impact>__Integrity__</integrity-impact>\n' + '    <availability-impact>__Availability__</availability-impact>\n' + '    <base-score>__BaseScore__</base-score>\n' + '    <base-severity>__BaseSeverityRating__</base-severity>\n' + '  </base_metrics>\n' + '\n' + '  <temporal_metrics>\n' + '    <exploit-code-maturity>__ExploitCodeMaturity__</exploit-code-maturity>\n' + '    <remediation-level>__RemediationLevel__</remediation-level>\n' + '    <report-confidence>__ReportConfidence__</report-confidence>\n' + '    <temporal-score>__TemporalScore__</temporal-score>\n' + '    <temporal-severity>__TemporalSeverityRating__</temporal-severity>\n' + '  </temporal_metrics>\n' + '\n' + '  <environmental_metrics>\n' + '    <confidentiality-requirement>__ConfidentialityRequirement__</confidentiality-requirement>\n' + '    <integrity-requirement>__IntegrityRequirement__</integrity-requirement>\n' + '    <availability-requirement>__AvailabilityRequirement__</availability-requirement>\n' + '    <modified-attack-vector>__ModifiedAttackVector__</modified-attack-vector>\n' + '    <modified-attack-complexity>__ModifiedAttackComplexity__</modified-attack-complexity>\n' + '    <modified-privileges-required>__ModifiedPrivilegesRequired__</modified-privileges-required>\n' + '    <modified-user-interaction>__ModifiedUserInteraction__</modified-user-interaction>\n' + '    <modified-scope>__ModifiedScope__</modified-scope>\n' + '    <modified-confidentiality-impact>__ModifiedConfidentiality__</modified-confidentiality-impact>\n' + '    <modified-integrity-impact>__ModifiedIntegrity__</modified-integrity-impact>\n' + '    <modified-availability-impact>__ModifiedAvailability__</modified-availability-impact>\n' + '    <environmental-score>__EnvironmentalScore__</environmental-score>\n' + '    <environmental-severity>__EnvironmentalSeverityRating__</environmental-severity>\n' + '  </environmental_metrics>\n' + '\n' + '</cvssv3.1>\n';
        let result = this.calculateCVSSFromMetrics(AttackVector, AttackComplexity, PrivilegesRequired, UserInteraction, Scope, Confidentiality, Integrity, Availability, ExploitCodeMaturity, RemediationLevel, ReportConfidence, ConfidentialityRequirement, IntegrityRequirement, AvailabilityRequirement, ModifiedAttackVector, ModifiedAttackComplexity, ModifiedPrivilegesRequired, ModifiedUserInteraction, ModifiedScope, ModifiedConfidentiality, ModifiedIntegrity, ModifiedAvailability);
        if (result.success !== true) {
            return result
        }
        let xmlOutput = xmlTemplate;
        xmlOutput = xmlOutput.replace("__AttackVector__", this.XML_MetricNames.MAV[AttackVector]);
        xmlOutput = xmlOutput.replace("__AttackComplexity__", this.XML_MetricNames.MAC[AttackComplexity]);
        xmlOutput = xmlOutput.replace("__PrivilegesRequired__", this.XML_MetricNames.MPR[PrivilegesRequired]);
        xmlOutput = xmlOutput.replace("__UserInteraction__", this.XML_MetricNames.MUI[UserInteraction]);
        xmlOutput = xmlOutput.replace("__Scope__", this.XML_MetricNames.MS[Scope]);
        xmlOutput = xmlOutput.replace("__Confidentiality__", this.XML_MetricNames.MCIA[Confidentiality]);
        xmlOutput = xmlOutput.replace("__Integrity__", this.XML_MetricNames.MCIA[Integrity]);
        xmlOutput = xmlOutput.replace("__Availability__", this.XML_MetricNames.MCIA[Availability]);
        xmlOutput = xmlOutput.replace("__BaseScore__", result.baseMetricScore);
        xmlOutput = xmlOutput.replace("__BaseSeverityRating__", result.baseSeverity);
        xmlOutput = xmlOutput.replace("__ExploitCodeMaturity__", this.XML_MetricNames.E[ExploitCodeMaturity || "X"]);
        xmlOutput = xmlOutput.replace("__RemediationLevel__", this.XML_MetricNames.RL[RemediationLevel || "X"]);
        xmlOutput = xmlOutput.replace("__ReportConfidence__", this.XML_MetricNames.RC[ReportConfidence || "X"]);
        xmlOutput = xmlOutput.replace("__TemporalScore__", result.temporalMetricScore);
        xmlOutput = xmlOutput.replace("__TemporalSeverityRating__", result.temporalSeverity);
        xmlOutput = xmlOutput.replace("__ConfidentialityRequirement__", this.XML_MetricNames.CIAR[ConfidentialityRequirement || "X"]);
        xmlOutput = xmlOutput.replace("__IntegrityRequirement__", this.XML_MetricNames.CIAR[IntegrityRequirement || "X"]);
        xmlOutput = xmlOutput.replace("__AvailabilityRequirement__", this.XML_MetricNames.CIAR[AvailabilityRequirement || "X"]);
        xmlOutput = xmlOutput.replace("__ModifiedAttackVector__", this.XML_MetricNames.MAV[ModifiedAttackVector || "X"]);
        xmlOutput = xmlOutput.replace("__ModifiedAttackComplexity__", this.XML_MetricNames.MAC[ModifiedAttackComplexity || "X"]);
        xmlOutput = xmlOutput.replace("__ModifiedPrivilegesRequired__", this.XML_MetricNames.MPR[ModifiedPrivilegesRequired || "X"]);
        xmlOutput = xmlOutput.replace("__ModifiedUserInteraction__", this.XML_MetricNames.MUI[ModifiedUserInteraction || "X"]);
        xmlOutput = xmlOutput.replace("__ModifiedScope__", this.XML_MetricNames.MS[ModifiedScope || "X"]);
        xmlOutput = xmlOutput.replace("__ModifiedConfidentiality__", this.XML_MetricNames.MCIA[ModifiedConfidentiality || "X"]);
        xmlOutput = xmlOutput.replace("__ModifiedIntegrity__", this.XML_MetricNames.MCIA[ModifiedIntegrity || "X"]);
        xmlOutput = xmlOutput.replace("__ModifiedAvailability__", this.XML_MetricNames.MCIA[ModifiedAvailability || "X"]);
        xmlOutput = xmlOutput.replace("__EnvironmentalScore__", result.environmentalMetricScore);
        xmlOutput = xmlOutput.replace("__EnvironmentalSeverityRating__", result.environmentalSeverity);
        return {
            success: true,
            xmlString: xmlOutput
        }
    }
    generateXMLFromVector(vectorString) {
        let metricValues = {
            AV: undefined,
            AC: undefined,
            PR: undefined,
            UI: undefined,
            S: undefined,
            C: undefined,
            I: undefined,
            A: undefined,
            E: undefined,
            RL: undefined,
            RC: undefined,
            CR: undefined,
            IR: undefined,
            AR: undefined,
            MAV: undefined,
            MAC: undefined,
            MPR: undefined,
            MUI: undefined,
            MS: undefined,
            MC: undefined,
            MI: undefined,
            MA: undefined
        };
        let badMetrics = [];
        if (!this.vectorStringRegex_31.test(vectorString)) {
            return {
                success: false,
                errorType: "MalformedVectorString"
            }
        }
        let metricNameValue = vectorString.substring(this.CVSSVersionIdentifier.length).split("/");
        for (let i in metricNameValue) {
            if (metricNameValue.hasOwnProperty(i)) {
                let singleMetric = metricNameValue[i].split(":");
                if (typeof metricValues[singleMetric[0]] === "undefined") {
                    metricValues[singleMetric[0]] = singleMetric[1]
                } else {
                    badMetrics.push(singleMetric[0])
                }
            }
        }
        if (badMetrics.length > 0) {
            return {
                success: false,
                errorType: "MultipleDefinitionsOfMetric",
                errorMetrics: badMetrics
            }
        }
        return this.generateXMLFromMetrics(metricValues.AV, metricValues.AC, metricValues.PR, metricValues.UI, metricValues.S, metricValues.C, metricValues.I, metricValues.A, metricValues.E, metricValues.RL, metricValues.RC, metricValues.CR, metricValues.IR, metricValues.AR, metricValues.MAV, metricValues.MAC, metricValues.MPR, metricValues.MUI, metricValues.MS, metricValues.MC, metricValues.MI, metricValues.MA)
    }
}
class CVSSv3_0 {
    CVSSVersionIdentifier = "CVSS:3.0"
    exploitabilityCoefficient = 8.22
    scopeCoefficient = 1.08
    vectorStringRegex_30 = /^CVSS:3\.0\/((AV:[NALP]|AC:[LH]|PR:[UNLH]|UI:[NR]|S:[UC]|[CIA]:[NLH]|E:[XUPFH]|RL:[XOTWU]|RC:[XURC]|[CIA]R:[XLMH]|MAV:[XNALP]|MAC:[XLH]|MPR:[XUNLH]|MUI:[XNR]|MS:[XUC]|M[CIA]:[XNLH])\/)*(AV:[NALP]|AC:[LH]|PR:[UNLH]|UI:[NR]|S:[UC]|[CIA]:[NLH]|E:[XUPFH]|RL:[XOTWU]|RC:[XURC]|[CIA]R:[XLMH]|MAV:[XNALP]|MAC:[XLH]|MPR:[XUNLH]|MUI:[XNR]|MS:[XUC]|M[CIA]:[XNLH])$/
    Weight = {
        AV: {
            N: 0.85,
            A: 0.62,
            L: 0.55,
            P: 0.2
        },
        AC: {
            H: 0.44,
            L: 0.77
        },
        PR: {
            U: {
                N: 0.85,
                L: 0.62,
                H: 0.27
            },
            C: {
                N: 0.85,
                L: 0.68,
                H: 0.5
            }
        },
        UI: {
            N: 0.85,
            R: 0.62
        },
        S: {
            U: 6.42,
            C: 7.52
        },
        CIA: {
            N: 0,
            L: 0.22,
            H: 0.56
        },
        E: {
            X: 1,
            U: 0.91,
            P: 0.94,
            F: 0.97,
            H: 1
        },
        RL: {
            X: 1,
            O: 0.95,
            T: 0.96,
            W: 0.97,
            U: 1
        },
        RC: {
            X: 1,
            U: 0.92,
            R: 0.96,
            C: 1
        },
        CIAR: {
            X: 1,
            L: 0.5,
            M: 1,
            H: 1.5
        }
    }
    severityRatings = [
        {
            name: "None",
            bottom: 0.0,
            top: 0.0
        }, {
            name: "Low",
            bottom: 0.1,
            top: 3.9
        }, {
            name: "Medium",
            bottom: 4.0,
            top: 6.9
        }, {
            name: "High",
            bottom: 7.0,
            top: 8.9
        }, {
            name: "Critical",
            bottom: 9.0,
            top: 10.0
        }
    ]
    XML_MetricNames = {
        E: {
            X: "NOT_DEFINED",
            U: "UNPROVEN",
            P: "PROOF_OF_CONCEPT",
            F: "FUNCTIONAL",
            H: "HIGH"
        },
        RL: {
            X: "NOT_DEFINED",
            O: "OFFICIAL_FIX",
            T: "TEMPORARY_FIX",
            W: "WORKAROUND",
            U: "UNAVAILABLE"
        },
        RC: {
            X: "NOT_DEFINED",
            U: "UNKNOWN",
            R: "REASONABLE",
            C: "CONFIRMED"
        },
        CIAR: {
            X: "NOT_DEFINED",
            L: "LOW",
            M: "MEDIUM",
            H: "HIGH"
        },
        MAV: {
            N: "NETWORK",
            A: "ADJACENT_NETWORK",
            L: "LOCAL",
            P: "PHYSICAL",
            X: "NOT_DEFINED"
        },
        MAC: {
            H: "HIGH",
            L: "LOW",
            X: "NOT_DEFINED"
        },
        MPR: {
            N: "NONE",
            L: "LOW",
            H: "HIGH",
            X: "NOT_DEFINED"
        },
        MUI: {
            N: "NONE",
            R: "REQUIRED",
            X: "NOT_DEFINED"
        },
        MS: {
            U: "UNCHANGED",
            C: "CHANGED",
            X: "NOT_DEFINED"
        },
        MCIA: {
            N: "NONE",
            L: "LOW",
            H: "HIGH",
            X: "NOT_DEFINED"
        }
    }
    static roundUp1(d) {
        return Math.ceil(d * 10) / 10
    }
    constructor(vector) {
        this.vector = vector
    }
    calculateCVSSFromMetrics(AttackVector, AttackComplexity, PrivilegesRequired, UserInteraction, Scope, Confidentiality, Integrity, Availability, ExploitCodeMaturity, RemediationLevel, ReportConfidence, ConfidentialityRequirement, IntegrityRequirement, AvailabilityRequirement, ModifiedAttackVector, ModifiedAttackComplexity, ModifiedPrivilegesRequired, ModifiedUserInteraction, ModifiedScope, ModifiedConfidentiality, ModifiedIntegrity, ModifiedAvailability) {
        let badMetrics = [];
        if (typeof AttackVector === "undefined" || AttackVector === "") {
            badMetrics.push("AV")
        }
        if (typeof AttackComplexity === "undefined" || AttackComplexity === "") {
            badMetrics.push("AC")
        }
        if (typeof PrivilegesRequired === "undefined" || PrivilegesRequired === "") {
            badMetrics.push("PR")
        }
        if (typeof UserInteraction === "undefined" || UserInteraction === "") {
            badMetrics.push("UI")
        }
        if (typeof Scope === "undefined" || Scope === "") {
            badMetrics.push("S")
        }
        if (typeof Confidentiality === "undefined" || Confidentiality === "") {
            badMetrics.push("C")
        }
        if (typeof Integrity === "undefined" || Integrity === "") {
            badMetrics.push("I")
        }
        if (typeof Availability === "undefined" || Availability === "") {
            badMetrics.push("A")
        }
        if (badMetrics.length > 0) {
            return {
                success: false,
                errorType: "MissingBaseMetric",
                errorMetrics: badMetrics
            }
        }
        let AV = AttackVector;
        let AC = AttackComplexity;
        let PR = PrivilegesRequired;
        let UI = UserInteraction;
        let S = Scope;
        let C = Confidentiality;
        let I = Integrity;
        let A = Availability;
        let E = ExploitCodeMaturity || "X";
        let RL = RemediationLevel || "X";
        let RC = ReportConfidence || "X";
        let CR = ConfidentialityRequirement || "X";
        let IR = IntegrityRequirement || "X";
        let AR = AvailabilityRequirement || "X";
        let MAV = ModifiedAttackVector || "X";
        let MAC = ModifiedAttackComplexity || "X";
        let MPR = ModifiedPrivilegesRequired || "X";
        let MUI = ModifiedUserInteraction || "X";
        let MS = ModifiedScope || "X";
        let MC = ModifiedConfidentiality || "X";
        let MI = ModifiedIntegrity || "X";
        let MA = ModifiedAvailability || "X";
        if (!this.Weight.AV.hasOwnProperty(AV)) {
            badMetrics.push("AV")
        }
        if (!this.Weight.AC.hasOwnProperty(AC)) {
            badMetrics.push("AC")
        }
        if (!this.Weight.PR.U.hasOwnProperty(PR)) {
            badMetrics.push("PR")
        }
        if (!this.Weight.UI.hasOwnProperty(UI)) {
            badMetrics.push("UI")
        }
        if (!this.Weight.S.hasOwnProperty(S)) {
            badMetrics.push("S")
        }
        if (!this.Weight.CIA.hasOwnProperty(C)) {
            badMetrics.push("C")
        }
        if (!this.Weight.CIA.hasOwnProperty(I)) {
            badMetrics.push("I")
        }
        if (!this.Weight.CIA.hasOwnProperty(A)) {
            badMetrics.push("A")
        }
        if (!this.Weight.E.hasOwnProperty(E)) {
            badMetrics.push("E")
        }
        if (!this.Weight.RL.hasOwnProperty(RL)) {
            badMetrics.push("RL")
        }
        if (!this.Weight.RC.hasOwnProperty(RC)) {
            badMetrics.push("RC")
        }
        if (!(CR === "X" || this.Weight.CIAR.hasOwnProperty(CR))) {
            badMetrics.push("CR")
        }
        if (!(IR === "X" || this.Weight.CIAR.hasOwnProperty(IR))) {
            badMetrics.push("IR")
        }
        if (!(AR === "X" || this.Weight.CIAR.hasOwnProperty(AR))) {
            badMetrics.push("AR")
        }
        if (!(MAV === "X" || this.Weight.AV.hasOwnProperty(MAV))) {
            badMetrics.push("MAV")
        }
        if (!(MAC === "X" || this.Weight.AC.hasOwnProperty(MAC))) {
            badMetrics.push("MAC")
        }
        if (!(MPR === "X" || this.Weight.PR.U.hasOwnProperty(MPR))) {
            badMetrics.push("MPR")
        }
        if (!(MUI === "X" || this.Weight.UI.hasOwnProperty(MUI))) {
            badMetrics.push("MUI")
        }
        if (!(MS === "X" || this.Weight.S.hasOwnProperty(MS))) {
            badMetrics.push("MS")
        }
        if (!(MC === "X" || this.Weight.CIA.hasOwnProperty(MC))) {
            badMetrics.push("MC")
        }
        if (!(MI === "X" || this.Weight.CIA.hasOwnProperty(MI))) {
            badMetrics.push("MI")
        }
        if (!(MA === "X" || this.Weight.CIA.hasOwnProperty(MA))) {
            badMetrics.push("MA")
        }
        if (badMetrics.length > 0) {
            return {
                success: false,
                errorType: "UnknownMetricValue",
                errorMetrics: badMetrics
            }
        }
        let metricWeightAV = this.Weight.AV[AV];
        let metricWeightAC = this.Weight.AC[AC];
        let metricWeightPR = this.Weight.PR[S][PR];
        let metricWeightUI = this.Weight.UI[UI];
        let metricWeightS = this.Weight.S[S];
        let metricWeightC = this.Weight.CIA[C];
        let metricWeightI = this.Weight.CIA[I];
        let metricWeightA = this.Weight.CIA[A];
        let metricWeightE = this.Weight.E[E];
        let metricWeightRL = this.Weight.RL[RL];
        let metricWeightRC = this.Weight.RC[RC];
        let metricWeightCR = this.Weight.CIAR[CR];
        let metricWeightIR = this.Weight.CIAR[IR];
        let metricWeightAR = this.Weight.CIAR[AR];
        let metricWeightMAV = this.Weight.AV[MAV !== "X" ? MAV : AV];
        let metricWeightMAC = this.Weight.AC[MAC !== "X" ? MAC : AC];
        let metricWeightMPR = this.Weight.PR[MS !== "X" ? MS : S][MPR !== "X" ? MPR : PR];
        let metricWeightMUI = this.Weight.UI[MUI !== "X" ? MUI : UI];
        let metricWeightMS = this.Weight.S[MS !== "X" ? MS : S];
        let metricWeightMC = this.Weight.CIA[MC !== "X" ? MC : C];
        let metricWeightMI = this.Weight.CIA[MI !== "X" ? MI : I];
        let metricWeightMA = this.Weight.CIA[MA !== "X" ? MA : A];
        let baseScore;
        let impactSubScore;
        let exploitabalitySubScore = this.exploitabilityCoefficient * metricWeightAV * metricWeightAC * metricWeightPR * metricWeightUI;
        let impactSubScoreMultiplier = (1 - ((1 - metricWeightC) * (1 - metricWeightI) * (1 - metricWeightA)));
        if (S === 'U') {
            impactSubScore = metricWeightS * impactSubScoreMultiplier
        } else {
            impactSubScore = metricWeightS * (impactSubScoreMultiplier - 0.029) - 3.25 * Math.pow(impactSubScoreMultiplier - 0.02, 15)
        }
        if (impactSubScore <= 0) {
            baseScore = 0
        } else {
            if (S === 'U') {
                baseScore = CVSSv3_0.roundUp1(Math.min((exploitabalitySubScore + impactSubScore), 10))
            } else {
                baseScore = CVSSv3_0.roundUp1(Math.min((exploitabalitySubScore + impactSubScore) * this.scopeCoefficient, 10))
            }
        }
        let temporalScore = CVSSv3_0.roundUp1(baseScore * metricWeightE * metricWeightRL * metricWeightRC);
        let envScore;
        let envModifiedImpactSubScore;
        let envModifiedExploitabalitySubScore = this.exploitabilityCoefficient * metricWeightMAV * metricWeightMAC * metricWeightMPR * metricWeightMUI;
        let envImpactSubScoreMultiplier = Math.min(1 - ((1 - metricWeightMC * metricWeightCR) * (1 - metricWeightMI * metricWeightIR) * (1 - metricWeightMA * metricWeightAR)), 0.915);
        if (MS === "U" || (MS === "X" && S === "U")) {
            envModifiedImpactSubScore = metricWeightMS * envImpactSubScoreMultiplier;
            envScore = CVSSv3_0.roundUp1(CVSSv3_0.roundUp1(Math.min((envModifiedImpactSubScore + envModifiedExploitabalitySubScore), 10)) * metricWeightE * metricWeightRL * metricWeightRC)
        } else {
            envModifiedImpactSubScore = metricWeightMS * (envImpactSubScoreMultiplier - 0.029) - 3.25 * Math.pow(envImpactSubScoreMultiplier - 0.02, 15);
            envScore = CVSSv3_0.roundUp1(CVSSv3_0.roundUp1(Math.min(this.scopeCoefficient * (envModifiedImpactSubScore + envModifiedExploitabalitySubScore), 10)) * metricWeightE * metricWeightRL * metricWeightRC)
        }
        if (envModifiedImpactSubScore <= 0) {
            envScore = 0
        }
        let vectorString = this.CVSSVersionIdentifier + "/AV:" + AV + "/AC:" + AC + "/PR:" + PR + "/UI:" + UI + "/S:" + S + "/C:" + C + "/I:" + I + "/A:" + A;
        if (E !== "X") {
            vectorString = vectorString + "/E:" + E
        }
        if (RL !== "X") {
            vectorString = vectorString + "/RL:" + RL
        }
        if (RC !== "X") {
            vectorString = vectorString + "/RC:" + RC
        }
        if (CR !== "X") {
            vectorString = vectorString + "/CR:" + CR
        }
        if (IR !== "X") {
            vectorString = vectorString + "/IR:" + IR
        }
        if (AR !== "X") {
            vectorString = vectorString + "/AR:" + AR
        }
        if (MAV !== "X") {
            vectorString = vectorString + "/MAV:" + MAV
        }
        if (MAC !== "X") {
            vectorString = vectorString + "/MAC:" + MAC
        }
        if (MPR !== "X") {
            vectorString = vectorString + "/MPR:" + MPR
        }
        if (MUI !== "X") {
            vectorString = vectorString + "/MUI:" + MUI
        }
        if (MS !== "X") {
            vectorString = vectorString + "/MS:" + MS
        }
        if (MC !== "X") {
            vectorString = vectorString + "/MC:" + MC
        }
        if (MI !== "X") {
            vectorString = vectorString + "/MI:" + MI
        }
        if (MA !== "X") {
            vectorString = vectorString + "/MA:" + MA
        }
        const result = {
            success: true,
            baseMetricScore: baseScore.toFixed(1),
            baseSeverity: this.severityRating(baseScore.toFixed(1)),
            temporalMetricScore: temporalScore.toFixed(1),
            temporalSeverity: this.severityRating(temporalScore.toFixed(1)),
            environmentalMetricScore: envScore.toFixed(1),
            environmentalSeverity: this.severityRating(envScore.toFixed(1)),
            vectorString: vectorString
        }
        this.baseMetricScore = result.baseMetricScore
        this.baseSeverity = result.baseSeverity
        this.environmentalMetricScore = result.environmentalMetricScore
        this.environmentalSeverity = result.environmentalSeverity
        this.temporalMetricScore = result.temporalMetricScore
        this.temporalSeverity = result.temporalSeverity
        return result
    }
    calculateCVSSFromVector(vectorString) {
        vectorString ??= this.vector
        let metricValues = {
            AV: undefined,
            AC: undefined,
            PR: undefined,
            UI: undefined,
            S: undefined,
            C: undefined,
            I: undefined,
            A: undefined,
            E: undefined,
            RL: undefined,
            RC: undefined,
            CR: undefined,
            IR: undefined,
            AR: undefined,
            MAV: undefined,
            MAC: undefined,
            MPR: undefined,
            MUI: undefined,
            MS: undefined,
            MC: undefined,
            MI: undefined,
            MA: undefined
        };
        let badMetrics = [];
        if (!this.vectorStringRegex_30.test(vectorString)) {
            return {
                success: false,
                errorType: "MalformedVectorString"
            }
        }
        let metricNameValue = vectorString.substring(this.CVSSVersionIdentifier.length).split("/");
        for (let i in metricNameValue) {
            if (metricNameValue.hasOwnProperty(i)) {
                let singleMetric = metricNameValue[i].split(":");
                if (typeof metricValues[singleMetric[0]] === "undefined") {
                    metricValues[singleMetric[0]] = singleMetric[1]
                } else {
                    badMetrics.push(singleMetric[0])
                }
            }
        }
        if (badMetrics.length > 0) {
            return {
                success: false,
                errorType: "MultipleDefinitionsOfMetric",
                errorMetrics: badMetrics
            }
        }
        return this.calculateCVSSFromMetrics(metricValues.AV, metricValues.AC, metricValues.PR, metricValues.UI, metricValues.S, metricValues.C, metricValues.I, metricValues.A, metricValues.E, metricValues.RL, metricValues.RC, metricValues.CR, metricValues.IR, metricValues.AR, metricValues.MAV, metricValues.MAC, metricValues.MPR, metricValues.MUI, metricValues.MS, metricValues.MC, metricValues.MI, metricValues.MA)
    }
    severityRating(score) {
        let severityRatingLength = this.severityRatings.length;
        let validatedScore = Number(score);
        if (isNaN(validatedScore)) {
            return validatedScore
        }
        for (let i = 0; i < severityRatingLength; i++) {
            if (score >= this.severityRatings[i].bottom && score <= this.severityRatings[i].top) {
                return this.severityRatings[i].name
            }
        }
        return undefined
    }
    generateXMLFromMetrics(AttackVector, AttackComplexity, PrivilegesRequired, UserInteraction, Scope, Confidentiality, Integrity, Availability, ExploitCodeMaturity, RemediationLevel, ReportConfidence, ConfidentialityRequirement, IntegrityRequirement, AvailabilityRequirement, ModifiedAttackVector, ModifiedAttackComplexity, ModifiedPrivilegesRequired, ModifiedUserInteraction, ModifiedScope, ModifiedConfidentiality, ModifiedIntegrity, ModifiedAvailability) {
        let xmlTemplate = '<?xml version="1.0" encoding="UTF-8"?>\n' + '<cvssv3.0 xmlns="https://www.first.org/cvss/cvss-v3.0.xsd"\n' + '  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n' + '  xsi:schemaLocation="https://www.first.org/cvss/cvss-v3.0.xsd https://www.first.org/cvss/cvss-v3.0.xsd"\n' + '  >\n' + '\n' + '  <base_metrics>\n' + '    <attack-vector>__AttackVector__</attack-vector>\n' + '    <attack-complexity>__AttackComplexity__</attack-complexity>\n' + '    <privileges-required>__PrivilegesRequired__</privileges-required>\n' + '    <user-interaction>__UserInteraction__</user-interaction>\n' + '    <scope>__Scope__</scope>\n' + '    <confidentiality-impact>__Confidentiality__</confidentiality-impact>\n' + '    <integrity-impact>__Integrity__</integrity-impact>\n' + '    <availability-impact>__Availability__</availability-impact>\n' + '    <base-score>__BaseScore__</base-score>\n' + '    <base-severity>__BaseSeverityRating__</base-severity>\n' + '  </base_metrics>\n' + '\n' + '  <temporal_metrics>\n' + '    <exploit-code-maturity>__ExploitCodeMaturity__</exploit-code-maturity>\n' + '    <remediation-level>__RemediationLevel__</remediation-level>\n' + '    <report-confidence>__ReportConfidence__</report-confidence>\n' + '    <temporal-score>__TemporalScore__</temporal-score>\n' + '    <temporal-severity>__TemporalSeverityRating__</temporal-severity>\n' + '  </temporal_metrics>\n' + '\n' + '  <environmental_metrics>\n' + '    <confidentiality-requirement>__ConfidentialityRequirement__</confidentiality-requirement>\n' + '    <integrity-requirement>__IntegrityRequirement__</integrity-requirement>\n' + '    <availability-requirement>__AvailabilityRequirement__</availability-requirement>\n' + '    <modified-attack-vector>__ModifiedAttackVector__</modified-attack-vector>\n' + '    <modified-attack-complexity>__ModifiedAttackComplexity__</modified-attack-complexity>\n' + '    <modified-privileges-required>__ModifiedPrivilegesRequired__</modified-privileges-required>\n' + '    <modified-user-interaction>__ModifiedUserInteraction__</modified-user-interaction>\n' + '    <modified-scope>__ModifiedScope__</modified-scope>\n' + '    <modified-confidentiality-impact>__ModifiedConfidentiality__</modified-confidentiality-impact>\n' + '    <modified-integrity-impact>__ModifiedIntegrity__</modified-integrity-impact>\n' + '    <modified-availability-impact>__ModifiedAvailability__</modified-availability-impact>\n' + '    <environmental-score>__EnvironmentalScore__</environmental-score>\n' + '    <environmental-severity>__EnvironmentalSeverityRating__</environmental-severity>\n' + '  </environmental_metrics>\n' + '\n' + '</cvssv3.0>\n';
        let result = this.calculateCVSSFromMetrics(AttackVector, AttackComplexity, PrivilegesRequired, UserInteraction, Scope, Confidentiality, Integrity, Availability, ExploitCodeMaturity, RemediationLevel, ReportConfidence, ConfidentialityRequirement, IntegrityRequirement, AvailabilityRequirement, ModifiedAttackVector, ModifiedAttackComplexity, ModifiedPrivilegesRequired, ModifiedUserInteraction, ModifiedScope, ModifiedConfidentiality, ModifiedIntegrity, ModifiedAvailability);
        if (result.success !== true) {
            return result
        }
        let xmlOutput = xmlTemplate;
        xmlOutput = xmlOutput.replace("__AttackVector__", this.XML_MetricNames.MAV[AttackVector]);
        xmlOutput = xmlOutput.replace("__AttackComplexity__", this.XML_MetricNames.MAC[AttackComplexity]);
        xmlOutput = xmlOutput.replace("__PrivilegesRequired__", this.XML_MetricNames.MPR[PrivilegesRequired]);
        xmlOutput = xmlOutput.replace("__UserInteraction__", this.XML_MetricNames.MUI[UserInteraction]);
        xmlOutput = xmlOutput.replace("__Scope__", this.XML_MetricNames.MS[Scope]);
        xmlOutput = xmlOutput.replace("__Confidentiality__", this.XML_MetricNames.MCIA[Confidentiality]);
        xmlOutput = xmlOutput.replace("__Integrity__", this.XML_MetricNames.MCIA[Integrity]);
        xmlOutput = xmlOutput.replace("__Availability__", this.XML_MetricNames.MCIA[Availability]);
        xmlOutput = xmlOutput.replace("__BaseScore__", result.baseMetricScore);
        xmlOutput = xmlOutput.replace("__BaseSeverityRating__", result.baseSeverity);
        xmlOutput = xmlOutput.replace("__ExploitCodeMaturity__", this.XML_MetricNames.E[ExploitCodeMaturity || "X"]);
        xmlOutput = xmlOutput.replace("__RemediationLevel__", this.XML_MetricNames.RL[RemediationLevel || "X"]);
        xmlOutput = xmlOutput.replace("__ReportConfidence__", this.XML_MetricNames.RC[ReportConfidence || "X"]);
        xmlOutput = xmlOutput.replace("__TemporalScore__", result.temporalMetricScore);
        xmlOutput = xmlOutput.replace("__TemporalSeverityRating__", result.temporalSeverity);
        xmlOutput = xmlOutput.replace("__ConfidentialityRequirement__", this.XML_MetricNames.CIAR[ConfidentialityRequirement || "X"]);
        xmlOutput = xmlOutput.replace("__IntegrityRequirement__", this.XML_MetricNames.CIAR[IntegrityRequirement || "X"]);
        xmlOutput = xmlOutput.replace("__AvailabilityRequirement__", this.XML_MetricNames.CIAR[AvailabilityRequirement || "X"]);
        xmlOutput = xmlOutput.replace("__ModifiedAttackVector__", this.XML_MetricNames.MAV[ModifiedAttackVector || "X"]);
        xmlOutput = xmlOutput.replace("__ModifiedAttackComplexity__", this.XML_MetricNames.MAC[ModifiedAttackComplexity || "X"]);
        xmlOutput = xmlOutput.replace("__ModifiedPrivilegesRequired__", this.XML_MetricNames.MPR[ModifiedPrivilegesRequired || "X"]);
        xmlOutput = xmlOutput.replace("__ModifiedUserInteraction__", this.XML_MetricNames.MUI[ModifiedUserInteraction || "X"]);
        xmlOutput = xmlOutput.replace("__ModifiedScope__", this.XML_MetricNames.MS[ModifiedScope || "X"]);
        xmlOutput = xmlOutput.replace("__ModifiedConfidentiality__", this.XML_MetricNames.MCIA[ModifiedConfidentiality || "X"]);
        xmlOutput = xmlOutput.replace("__ModifiedIntegrity__", this.XML_MetricNames.MCIA[ModifiedIntegrity || "X"]);
        xmlOutput = xmlOutput.replace("__ModifiedAvailability__", this.XML_MetricNames.MCIA[ModifiedAvailability || "X"]);
        xmlOutput = xmlOutput.replace("__EnvironmentalScore__", result.environmentalMetricScore);
        xmlOutput = xmlOutput.replace("__EnvironmentalSeverityRating__", result.environmentalSeverity);
        return {
            success: true,
            xmlString: xmlOutput
        }
    }
    generateXMLFromVector(vectorString) {
        let metricValues = {
            AV: undefined,
            AC: undefined,
            PR: undefined,
            UI: undefined,
            S: undefined,
            C: undefined,
            I: undefined,
            A: undefined,
            E: undefined,
            RL: undefined,
            RC: undefined,
            CR: undefined,
            IR: undefined,
            AR: undefined,
            MAV: undefined,
            MAC: undefined,
            MPR: undefined,
            MUI: undefined,
            MS: undefined,
            MC: undefined,
            MI: undefined,
            MA: undefined
        };
        let badMetrics = [];
        if (!this.vectorStringRegex_30.test(vectorString)) {
            return {
                success: false,
                errorType: "MalformedVectorString"
            }
        }
        let metricNameValue = vectorString.substring(this.CVSSVersionIdentifier.length).split("/");
        for (let i in metricNameValue) {
            if (metricNameValue.hasOwnProperty(i)) {
                let singleMetric = metricNameValue[i].split(":");
                if (typeof metricValues[singleMetric[0]] === "undefined") {
                    metricValues[singleMetric[0]] = singleMetric[1]
                } else {
                    badMetrics.push(singleMetric[0])
                }
            }
        }
        if (badMetrics.length > 0) {
            return {
                success: false,
                errorType: "MultipleDefinitionsOfMetric",
                errorMetrics: badMetrics
            }
        }
        return this.generateXMLFromMetrics(metricValues.AV, metricValues.AC, metricValues.PR, metricValues.UI, metricValues.S, metricValues.C, metricValues.I, metricValues.A, metricValues.E, metricValues.RL, metricValues.RC, metricValues.CR, metricValues.IR, metricValues.AR, metricValues.MAV, metricValues.MAC, metricValues.MPR, metricValues.MUI, metricValues.MS, metricValues.MC, metricValues.MI, metricValues.MA)
    }
}
