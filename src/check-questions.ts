export type RecordField={id:string;label:string;type:"text"|"number"|"count"|"date"|"nonnegative"};
export type CheckQuestion={id:string;label:string;kind:"yesno"|"record";repeat?:boolean;fields?:RecordField[]};
export const checkQuestions:Record<string,CheckQuestion[]>={
 "check-1": [
  {
   "id": "q1",
   "label": "Current, minimum and maximum temperature for each medicines fridge.",
   "kind": "record",
   "repeat": true,
   "fields": [
    {
     "id": "area",
     "label": "Fridge name",
     "type": "text"
    },
    {
     "id": "current",
     "label": "Current °C",
     "type": "number"
    },
    {
     "id": "minimum",
     "label": "Minimum °C",
     "type": "number"
    },
    {
     "id": "maximum",
     "label": "Maximum °C",
     "type": "number"
    }
   ]
  },
  {
   "id": "q2",
   "label": "Were all three readings between 2°C and 8°C?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Was the thermometer reset after the readings were taken?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Is the fridge free of food, drink and other non-medicinal items?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Is stock spaced so air can circulate, with the door closing fully?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "If any reading was out of range, was the pharmacist told at once and the action recorded?",
   "kind": "yesno"
  }
 ],
 "check-2": [
  {
   "id": "q1",
   "label": "Current, minimum and maximum temperature for the dispensary and each other medicines storage area.",
   "kind": "record",
   "repeat": true,
   "fields": [
    {
     "id": "area",
     "label": "Storage area",
     "type": "text"
    },
    {
     "id": "current",
     "label": "Current °C",
     "type": "number"
    },
    {
     "id": "minimum",
     "label": "Minimum °C",
     "type": "number"
    },
    {
     "id": "maximum",
     "label": "Maximum °C",
     "type": "number"
    }
   ]
  },
  {
   "id": "q2",
   "label": "Were all readings at or below 25°C?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Was the thermometer reset after the readings were taken?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Are medicines stored off the floor and away from direct sunlight and heat sources?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "If any reading was out of range, was the pharmacist told at once and the action recorded?",
   "kind": "yesno"
  }
 ],
 "check-3": [
  {
   "id": "q1",
   "label": "Number of near misses logged today. Enter 0 if none.",
   "kind": "record",
   "repeat": false,
   "fields": [
    {
     "id": "count",
     "label": "Near misses today",
     "type": "count"
    }
   ]
  },
  {
   "id": "q2",
   "label": "Was each near miss recorded at the time it was caught?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Does each entry say what went wrong and the likely contributing factor?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Was any error that reached a patient reported to the pharmacist on duty straight away?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Has the pharmacist on duty seen today's entries?",
   "kind": "yesno"
  }
 ],
 "check-4": [
  {
   "id": "q1",
   "label": "Is the controlled drugs safe locked, with keys held as the key-holding policy requires?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Are all prescription medicines, including bags awaiting collection, secured in the dispensary?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Are the fridge doors closed and the fridges running?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Are prescriptions and patient records put away and computers logged off?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Is confidential waste secured?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Are the doors and shutters locked and the alarm set?",
   "kind": "yesno"
  }
 ],
 "check-5": [
  {
   "id": "q1",
   "label": "Was a registered pharmacist on the premises before any medicine was sold or supplied?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Are the current registration certificates for the pharmacy and the supervising pharmacist on public display?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Is staffing sufficient for today's expected workload?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Have handover notes from the previous shift been read?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Are the dispensing system, label printer and interaction alerts working?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Is the patient consultation area clean and available?",
   "kind": "yesno"
  }
 ],
 "check-6": [
  {
   "id": "q1",
   "label": "Has each pharmacist on duty today entered their name and PSI registration number?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Are arrival and departure times recorded for each pharmacist?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Has each pharmacist signed their entry?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "If a pharmaceutical assistant covered a temporary absence, is that period recorded?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Was a pharmacist present for all of today's opening hours, with no gap in the register?",
   "kind": "yesno"
  }
 ],
 "check-7": [
  {
   "id": "q1",
   "label": "Has every Schedule 2 receipt and supply today been entered in the register, today or by tomorrow at the latest?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Does each supply entry show the date, patient name and address, prescriber and quantity?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Does each receipt entry show the supplier's name and address and the quantity?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Is the running balance updated for every entry?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Were corrections made only by a dated, signed marginal note or footnote?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Was every controlled drug prescription checked for validity before supply?",
   "kind": "yesno"
  },
  {
   "id": "q7",
   "label": "Are all Schedule 2 and 3 controlled drugs locked in the safe, with the key under the pharmacist's control?",
   "kind": "yesno"
  }
 ],
 "check-8": [
  {
   "id": "q1",
   "label": "Has today's prescription register (daily audit report) been printed?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Has a pharmacist signed and dated it today or within 24 hours?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Do the entries match today's prescriptions for patient, prescriber, product, quantity and prescription date?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Is each emergency supply recorded with its reason?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Have today's dispensed prescriptions been filed for retention?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Is the report filed with the registers for the previous two years?",
   "kind": "yesno"
  }
 ],
 "check-9": [
  {
   "id": "q1",
   "label": "Was every pack carrying a 2D barcode scanned and decommissioned at supply?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Was the anti-tamper seal checked on each of those packs?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Was every alert investigated before the pack was supplied?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Were packs with unresolved alerts quarantined away from live stock?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Were unresolved alerts reported as the pharmacy's procedure requires?",
   "kind": "yesno"
  }
 ],
 "check-10": [
  {
   "id": "q1",
   "label": "Has every outstanding owing been checked against stock received this week?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Is every owing older than one week either ordered, supplied or followed up with the patient?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Have bags uncollected beyond the pharmacy's time limit been referred to the pharmacist?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Have fridge items and controlled drugs awaiting collection been checked separately?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Were items returned to stock only on the pharmacist's decision, with patient labels removed?",
   "kind": "yesno"
  }
 ],
 "check-11": [
  {
   "id": "q1",
   "label": "Are patient-returned medicines kept in the designated area, separate from live stock?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Are expired and damaged medicines segregated from live stock?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Have patient details been removed from or obscured on returned packs?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Have returned controlled drugs been handed to the pharmacist?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Are the medicines waste and sharps bins closed and below the fill line?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Date of the last waste collection.",
   "kind": "record",
   "repeat": false,
   "fields": [
    {
     "id": "date",
     "label": "Last collection date",
     "type": "date"
    }
   ]
  }
 ],
 "check-12": [
  {
   "id": "q1",
   "label": "Were benches, the sink and dispensing equipment cleaned as the cleaning schedule requires?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Is the fridge interior clean and free of spills and ice build-up?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Are shelves and floors in all storage areas clean and uncluttered?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Does the dispensary sink have hot and cold water, soap and hand-drying supplies?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Are tablet counters and measures cleaned after use?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Are staff toilet and hand-washing facilities clean and stocked?",
   "kind": "yesno"
  },
  {
   "id": "q7",
   "label": "Has the cleaning record been signed for this week?",
   "kind": "yesno"
  }
 ],
 "check-13": [
  {
   "id": "q1",
   "label": "Was the fire alarm tested this week and heard throughout the premises?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Call point used for the test.",
   "kind": "record",
   "repeat": false,
   "fields": [
    {
     "id": "callPoint",
     "label": "Call point",
     "type": "text"
    }
   ]
  },
  {
   "id": "q3",
   "label": "Are all exit routes and fire doors clear and unlocked during opening hours?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Are exit signs visible and lit?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Are extinguishers in place and unobstructed?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Has the test been entered in the fire register?",
   "kind": "yesno"
  }
 ],
 "check-14": [
  {
   "id": "q1",
   "label": "Schedule 2 products checked this week.",
   "kind": "record",
   "repeat": false,
   "fields": [
    {
     "id": "products",
     "label": "Products checked",
     "type": "text"
    }
   ]
  },
  {
   "id": "q2",
   "label": "Does the physical stock in the safe match the register balance for each product checked?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "For methadone and other liquids, was the volume measured and any overage accounted for?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Were dispensed items awaiting collection and expired stock included in the count?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Was the check recorded in the register, dated and signed by the pharmacist?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "If a discrepancy was found, was it investigated, recorded and reported to the supervising pharmacist?",
   "kind": "yesno"
  }
 ],
 "check-15": [
  {
   "id": "q1",
   "label": "Is there a valid, current prescription for every patient dosed this week?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Is every supervised and take-away dose this week recorded?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Were missed doses recorded, and the prescriber contacted where the procedure requires it?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Do the controlled drugs register entries match the doses supplied?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Are pre-poured doses labelled with the patient's name and stored in the safe?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Were take-away doses supplied in child-resistant containers?",
   "kind": "yesno"
  }
 ],
 "check-16": [
  {
   "id": "q1",
   "label": "Have all HPRA recalls and safety notices received this week been read?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Has stock been checked against every recalled batch?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Has affected stock been quarantined and returned as the notice instructs?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "For patient-level recalls, have affected patients been identified and contacted?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Is the action taken on each notice recorded and signed?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Have relevant notices and PSI alerts been shared with the team?",
   "kind": "yesno"
  }
 ],
 "check-17": [
  {
   "id": "q1",
   "label": "Is there an entry for every day the pharmacy opened this week?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Is each entry complete, with name, registration number, times and signature?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Do the entries cover all opening hours without a gap?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Was each locum's registration verified on the PSI register before they worked?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Is any pharmaceutical assistant cover recorded and within the permitted limits?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Has the supervising pharmacist signed and dated this week's review?",
   "kind": "yesno"
  }
 ],
 "check-18": [
  {
   "id": "q1",
   "label": "Areas or shelf sections checked this month.",
   "kind": "record",
   "repeat": false,
   "fields": [
    {
     "id": "areas",
     "label": "Areas or shelf sections",
     "type": "text"
    }
   ]
  },
  {
   "id": "q2",
   "label": "Is every storage area on schedule within the check cycle, including the fridge, medicines counter, storerooms and controlled drugs safe?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Have items inside the pharmacy's short-date window been marked?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Have expired items been removed from live stock to the segregated area?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Is the shortest-dated stock placed to be used first?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Have expired controlled drugs been passed to the pharmacist?",
   "kind": "yesno"
  },
  {
   "id": "q7",
   "label": "Is the check recorded, dated and signed?",
   "kind": "yesno"
  }
 ],
 "check-19": [
  {
   "id": "q1",
   "label": "Were all claims for the month submitted to the PCRS by the deadline?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Do the claim totals for each scheme match the dispensing system's records?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Have last month's rejected claims been corrected and resubmitted?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Are the prescriptions and supporting documents for claims filed and retrievable?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Has the payment listing been reconciled against the claims submitted?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Have unexplained differences been raised with the pharmacist or owner?",
   "kind": "yesno"
  }
 ],
 "check-20": [
  {
   "id": "q1",
   "label": "Does the physical high-tech stock match the records for each patient?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Was each item ordered against a valid prescription for a named patient?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Are high-tech medicines stored separately from other stock and identified by patient?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Were fridge-stored high-tech items within range all month?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Has stock for patients who stopped treatment been dealt with as the HSE procedure requires?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Are all orders and receipts recorded on the HSE high-tech ordering system?",
   "kind": "yesno"
  },
  {
   "id": "q7",
   "label": "Have discrepancies been reported to the pharmacist?",
   "kind": "yesno"
  }
 ],
 "check-21": [
  {
   "id": "q1",
   "label": "Is the first aid kit fully stocked with in-date items?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Was the emergency lighting tested and working?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Is each extinguisher in place, with its gauge in the green and its pin and seal intact?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Is the service label on each extinguisher in date?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Is the accident record available and up to date?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Are the results entered in the fire register?",
   "kind": "yesno"
  }
 ],
 "check-22": [
  {
   "id": "q1",
   "label": "Has every Schedule 2 product in the safe been counted and compared with its register balance?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Do all balances match?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Were this month's entries made on the day or the next day, in date order and in full?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Do supplier invoices and requisitions match the receipts entered?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Is expired stock marked, segregated in the safe and still included in the register balance?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Are patient-returned controlled drugs kept separate from stock and recorded outside the register?",
   "kind": "yesno"
  },
  {
   "id": "q7",
   "label": "Is the reconciliation recorded, dated and signed by the pharmacist?",
   "kind": "yesno"
  },
  {
   "id": "q8",
   "label": "Was any discrepancy investigated and reported to the supervising and superintendent pharmacists?",
   "kind": "yesno"
  }
 ],
 "check-23": [
  {
   "id": "q1",
   "label": "Does the anaphylaxis kit hold adrenaline in the quantities the vaccination protocol requires?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Are all items in the kit in date?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Is the kit within immediate reach of the vaccination area?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Were vaccines stored between 2°C and 8°C all month?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Is a sharps bin available and below the fill line?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Are needles, syringes, swabs and gloves in sufficient supply?",
   "kind": "yesno"
  },
  {
   "id": "q7",
   "label": "Have all vaccinations given this month been recorded and reported as required?",
   "kind": "yesno"
  }
 ],
 "check-24": [
  {
   "id": "q1",
   "label": "Number of near misses and number of errors that reached a patient this month.",
   "kind": "record",
   "repeat": false,
   "fields": [
    {
     "id": "nearMisses",
     "label": "Near misses",
     "type": "count"
    },
    {
     "id": "errors",
     "label": "Errors reaching a patient",
     "type": "count"
    }
   ]
  },
  {
   "id": "q2",
   "label": "Has the supervising pharmacist reviewed every record for the month?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Does each error record show contributing factors, corrective action and preventative action?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Have all identified actions been completed?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Were errors reported to the superintendent pharmacist?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Have the records been checked for recurring patterns, such as look-alike products or busy periods?",
   "kind": "yesno"
  },
  {
   "id": "q7",
   "label": "Have the lessons been shared with the whole team?",
   "kind": "yesno"
  },
  {
   "id": "q8",
   "label": "Has any SOP affected by this month's findings been flagged for update?",
   "kind": "yesno"
  }
 ],
 "check-25": [
  {
   "id": "q1",
   "label": "Is there a training record for every staff member involved in selling or supplying medicines?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Has each staff member signed the SOPs relevant to their role?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Have this month's new starters completed induction, including confidentiality and when to refer to the pharmacist?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Was training due this month completed and recorded?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Has staff competence been checked by observation or questioning?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Are the records available on the premises?",
   "kind": "yesno"
  }
 ],
 "check-26": [
  {
   "id": "q1",
   "label": "Are all medicines stored inside the registered premises, in designated areas and off the floor?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Are pharmacy-only medicines kept where the public cannot reach them?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Are the public, dispensary and storage areas clean, well maintained and professionally presented?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Are dispensary benches uncluttered, with clear space for labelling and pharmacist checking?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Is the consultation area clean, private and free of stored stock?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Are patients told they can ask for a private consultation?",
   "kind": "yesno"
  },
  {
   "id": "q7",
   "label": "Is the premises accessible for wheelchair users and people with mobility or sight difficulties?",
   "kind": "yesno"
  },
  {
   "id": "q8",
   "label": "Can the registration certificates be read from the public area, and are they current?",
   "kind": "yesno"
  },
  {
   "id": "q9",
   "label": "Have defects such as damp, poor lighting or poor ventilation been reported?",
   "kind": "yesno"
  }
 ],
 "check-27": [
  {
   "id": "q1",
   "label": "Is the electronic balance working, with its calibration in date?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Are the certified weights present and maintained?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Are the glass measures and compounding equipment present, clean and undamaged?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Are all thermometers working, with calibration in date?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Are the dispensing computers, label printers and scanners working, with backups running?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Are child-resistant closures and dispensing containers in stock?",
   "kind": "yesno"
  },
  {
   "id": "q7",
   "label": "Are up-to-date reference sources accessible to the pharmacist?",
   "kind": "yesno"
  },
  {
   "id": "q8",
   "label": "Have faults been logged and repairs arranged?",
   "kind": "yesno"
  }
 ],
 "check-28": [
  {
   "id": "q1",
   "label": "Are floors, stairs and walkways free of slip and trip hazards?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Is stock stored safely, with heavy items at a safe height and steps in good condition?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Are cables, plugs and sockets undamaged and not overloaded?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Are sharps and hazardous waste handled as the procedure requires?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Do staff know the lone working and robbery procedures?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Have this quarter's accidents and near accidents been recorded and followed up?",
   "kind": "yesno"
  },
  {
   "id": "q7",
   "label": "Can staff access the safety statement?",
   "kind": "yesno"
  },
  {
   "id": "q8",
   "label": "Have hazards found today been reported to the owner?",
   "kind": "yesno"
  }
 ],
 "check-29": [
  {
   "id": "q1",
   "label": "SOP selected, its version number and implementation date.",
   "kind": "record",
   "repeat": false,
   "fields": [
    {
     "id": "sop",
     "label": "SOP name",
     "type": "text"
    },
    {
     "id": "version",
     "label": "Version",
     "type": "text"
    },
    {
     "id": "date",
     "label": "Implementation date",
     "type": "date"
    }
   ]
  },
  {
   "id": "q2",
   "label": "Was the process observed being carried out?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Did the observed practice match the SOP?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Have any deviations been recorded and added to an action plan?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Have the staff carrying out the process been trained on the current version?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Is the SOP within its review date?",
   "kind": "yesno"
  },
  {
   "id": "q7",
   "label": "Has the superintendent pharmacist approved the current version?",
   "kind": "yesno"
  }
 ],
 "check-30": [
  {
   "id": "q1",
   "label": "Is all expired Schedule 2 stock marked and segregated in the safe?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Has witnessed destruction been requested for the expired Schedule 2 stock held?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Was every destruction this quarter witnessed by an authorised person?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Does the register show the date, quantity and witness for each destruction?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Were patient-returned controlled drugs destroyed and recorded separately from pharmacy stock?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Are destruction records for the last two years available at the pharmacy?",
   "kind": "yesno"
  }
 ],
 "check-31": [
  {
   "id": "q1",
   "label": "Does the pharmacist assess whether each delivery request is appropriate?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Does the pharmacist confirm that counselling can be achieved without face-to-face contact?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Is a full therapeutic review done every time a prescription is delivered?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Do patients receive enough information on use, storage and disposal?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Is the delivery method secure and prompt, with access limited to authorised people?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Does the method protect the medicines in transit, including fridge items?",
   "kind": "yesno"
  },
  {
   "id": "q7",
   "label": "Is there an itemised audit trail from the pharmacy to a signature on receipt?",
   "kind": "yesno"
  },
  {
   "id": "q8",
   "label": "Are failed deliveries handled as the procedure requires?",
   "kind": "yesno"
  }
 ],
 "check-32": [
  {
   "id": "q1",
   "label": "Is a current confidentiality policy in place?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Have all staff been trained in it, with records kept?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Can conversations at the counter and in the consultation area be held without being overheard?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Are screens, prescriptions and bagged medicines out of public view?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Is confidential waste shredded or collected by a secure contractor?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Are patient labels removed from returned medicines before disposal?",
   "kind": "yesno"
  },
  {
   "id": "q7",
   "label": "Was any breach this quarter recorded and reported to the owner?",
   "kind": "yesno"
  }
 ],
 "check-33": [
  {
   "id": "q1",
   "label": "Number of sales observed. PSI's self-assessment uses five.",
   "kind": "record",
   "repeat": false,
   "fields": [
    {
     "id": "count",
     "label": "Sales observed",
     "type": "count"
    }
   ]
  },
  {
   "id": "q2",
   "label": "Was a pharmacist present and supervising each sale?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Did staff ask who the medicine was for, the symptoms, their duration and other medicines taken?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Was the pharmacist personally involved in every codeine sale?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Was codeine supplied only where non-codeine pain relief had been tried or was unsuitable?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Was each codeine patient advised on short-term use and the risk of dependence?",
   "kind": "yesno"
  },
  {
   "id": "q7",
   "label": "Are codeine products stored out of the public's sight and reach?",
   "kind": "yesno"
  },
  {
   "id": "q8",
   "label": "Were repeat or multiple-pack requests for pseudoephedrine and similar products referred to the pharmacist?",
   "kind": "yesno"
  },
  {
   "id": "q9",
   "label": "Have all staff been trained on the codeine SOP, with records kept?",
   "kind": "yesno"
  }
 ],
 "check-34": [
  {
   "id": "q1",
   "label": "Number of complaints and incidents this quarter.",
   "kind": "record",
   "repeat": false,
   "fields": [
    {
     "id": "complaints",
     "label": "Complaints",
     "type": "count"
    },
    {
     "id": "incidents",
     "label": "Incidents",
     "type": "count"
    }
   ]
  },
  {
   "id": "q2",
   "label": "Is each one recorded with the date, details and action taken?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Did each complainant receive a response within the pharmacy's stated time?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Were serious incidents reported to the superintendent pharmacist and owner?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Have all agreed actions been completed?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Have the records been checked for recurring causes?",
   "kind": "yesno"
  },
  {
   "id": "q7",
   "label": "Have the lessons been shared with the team?",
   "kind": "yesno"
  }
 ],
 "check-35": [
  {
   "id": "q1",
   "label": "Does every user have their own login to the dispensing system?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Have accounts for staff who left this quarter been removed?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Do access levels match each person's role?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Are backups running, and has a restore been tested?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Is CCTV signage displayed and footage kept only for the stated period?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Were data access requests answered within one month?",
   "kind": "yesno"
  },
  {
   "id": "q7",
   "label": "Was any data breach recorded and, where required, reported to the Data Protection Commission within 72 hours?",
   "kind": "yesno"
  },
  {
   "id": "q8",
   "label": "Are contracts in place with the software, shredding and CCTV suppliers?",
   "kind": "yesno"
  }
 ],
 "check-36": [
  {
   "id": "q1",
   "label": "Was a full evacuation drill carried out?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Date of the drill and time taken to evacuate.",
   "kind": "record",
   "repeat": false,
   "fields": [
    {
     "id": "date",
     "label": "Drill date",
     "type": "date"
    },
    {
     "id": "minutes",
     "label": "Evacuation time (minutes)",
     "type": "nonnegative"
    }
   ]
  },
  {
   "id": "q3",
   "label": "Did all staff reach the assembly point?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Did staff know how to help customers leave, including anyone in the consultation area?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Was the dispensary left secure during the drill?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Is the drill recorded in the fire register, with any problems noted?",
   "kind": "yesno"
  },
  {
   "id": "q7",
   "label": "Has each problem been assigned to someone to fix?",
   "kind": "yesno"
  }
 ],
 "check-37": [
  {
   "id": "q1",
   "label": "Has every applicable section been completed in the last 12 months?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Did the supervising pharmacist complete each section with the pharmacy team?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Has a compliance level been selected for each section?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Is there an action plan for every area that fell short of compliant?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Does each action have an owner and a due date?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Have last year's actions been completed?",
   "kind": "yesno"
  },
  {
   "id": "q7",
   "label": "Are the completed assessment and action plans kept at the pharmacy for inspection?",
   "kind": "yesno"
  }
 ],
 "check-38": [
  {
   "id": "q1",
   "label": "Has each staff member had a training review this year?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Does each staff member have a training plan for the coming year?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Has every pharmacist met their CPD requirements for the year?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Has training been delivered on new services, SOP changes and new PSI guidance?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Do staffing levels and skill mix still match the services offered?",
   "kind": "yesno"
  }
 ],
 "check-39": [
  {
   "id": "q1",
   "label": "Services offered that need specific training.",
   "kind": "record",
   "repeat": false,
   "fields": [
    {
     "id": "services",
     "label": "Services offered",
     "type": "text"
    }
   ]
  },
  {
   "id": "q2",
   "label": "Does each vaccinating pharmacist hold in-date vaccination, CPR and anaphylaxis training?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Are the training certificates on file?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Do the service procedures reflect this year's programme and current guidance?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Does the consultation area still meet the requirements for vaccination?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Are pharmacists trained to current guidance for each other clinical service offered?",
   "kind": "yesno"
  }
 ],
 "check-40": [
  {
   "id": "q1",
   "label": "Was the continued registration application submitted before the deadline?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Has the fee been paid?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Are the owner, superintendent and supervising pharmacist details on the register correct?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Were this year's changes in ownership, key personnel or premises notified to the PSI?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Does the floor plan held by the PSI match the current premises?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Is the new certificate on public display?",
   "kind": "yesno"
  }
 ],
 "check-41": [
  {
   "id": "q1",
   "label": "Have the superintendent pharmacist and owner reviewed every completed section?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Have they signed each action plan?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Have the resources needed to complete the actions been provided?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Support given to the supervising pharmacist during the assessment.",
   "kind": "record",
   "repeat": false,
   "fields": [
    {
     "id": "support",
     "label": "Support given",
     "type": "text"
    }
   ]
  },
  {
   "id": "q5",
   "label": "Have overdue actions been given new dates and escalated?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Are the signed plans kept at the pharmacy?",
   "kind": "yesno"
  }
 ],
 "check-42": [
  {
   "id": "q1",
   "label": "Are all the SOPs that PSI recommends in place, plus one for each additional service?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Has each SOP been reviewed this year and given a new review date?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Has the superintendent pharmacist approved each SOP?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Do the SOPs reflect this year's changes in legislation and PSI guidance?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Do they reflect lessons from this year's errors and near misses?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Are superseded versions archived under version control?",
   "kind": "yesno"
  },
  {
   "id": "q7",
   "label": "Have all staff read and signed the current versions relevant to their role?",
   "kind": "yesno"
  }
 ],
 "check-43": [
  {
   "id": "q1",
   "label": "Has each pharmaceutical fridge been serviced this year?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Is the service report on file?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Have thermometers been calibrated or replaced, with certificates on file?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Has each fridge alarm been tested?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Is fridge capacity still adequate for orderly, well-spaced storage?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Is there a plan for fridge failure, including where stock will be moved?",
   "kind": "yesno"
  }
 ],
 "check-44": [
  {
   "id": "q1",
   "label": "Has every pharmacist's registration been checked on the PSI register this year?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Has every pharmaceutical assistant's registration been checked?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Were regular locums included in the check?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Is the date of each check recorded?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Are any conditions attached to a registration known and managed?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Does the supervising pharmacist still meet the experience requirement and supervise only this pharmacy?",
   "kind": "yesno"
  },
  {
   "id": "q7",
   "label": "Are technicians' qualifications on file?",
   "kind": "yesno"
  }
 ],
 "check-45": [
  {
   "id": "q1",
   "label": "Is there a written plan covering loss of pharmacist cover, IT failure, power failure, fridge failure and loss of premises?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Has the plan been reviewed this year?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Are emergency contacts current for locums, the IT supplier, wholesalers, the PSI and the HSE?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Do staff know the temporary closure procedure, including how patients are told?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Does the plan cover patients on daily supervised doses during a closure?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "If the plan was tested or used this year, were the lessons recorded?",
   "kind": "yesno"
  }
 ],
 "check-46": [
  {
   "id": "q1",
   "label": "Is the medicines waste contractor authorised, with collection records on file?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Does the confidential waste contractor provide certificates of destruction?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Is a pest control contract in place, with visit reports on file?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Are the alarm, CCTV and fire system maintenance contracts current?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Does every contractor with access to patient data have a data processing agreement?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Has each contractor's performance been reviewed this year?",
   "kind": "yesno"
  }
 ],
 "check-47": [
  {
   "id": "q1",
   "label": "Has the safety statement been reviewed and signed this year?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Do the risk assessments cover manual handling, lone working, robbery and aggression, sharps and hazardous medicines?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Do they reflect this year's changes in premises, services or staffing?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Has the safety statement been brought to every staff member's attention?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Have the actions arising from this year's accidents been completed?",
   "kind": "yesno"
  }
 ],
 "check-48": [
  {
   "id": "q1",
   "label": "Have all extinguishers been serviced by a competent contractor this year?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Has the fire alarm system been serviced at the required intervals?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Has the emergency lighting been serviced?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Are the service certificates filed in the fire register?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Has the fire risk assessment been reviewed?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Have all reported defects been fixed?",
   "kind": "yesno"
  }
 ],
 "check-49": [
  {
   "id": "q1",
   "label": "Is professional indemnity cover in place for the pharmacy and every pharmacist, including locums?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Does the cover include every service offered, such as vaccination?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Have employer's liability and public liability cover been renewed?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Do the sums insured reflect current stock values, including fridge stock?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Are the policy documents on file?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Were this year's incidents notified to the insurer as the policy requires?",
   "kind": "yesno"
  }
 ],
 "check-50": [
  {
   "id": "q1",
   "label": "Is there a written retention schedule covering prescriptions, registers, patient records, CCTV and staff records?",
   "kind": "yesno"
  },
  {
   "id": "q2",
   "label": "Have prescriptions and prescription registers been kept for at least two years?",
   "kind": "yesno"
  },
  {
   "id": "q3",
   "label": "Have controlled drugs registers been kept for at least two years from the last entry?",
   "kind": "yesno"
  },
  {
   "id": "q4",
   "label": "Were records past their retention period securely destroyed, with the destruction recorded?",
   "kind": "yesno"
  },
  {
   "id": "q5",
   "label": "Is the privacy notice current and available to patients?",
   "kind": "yesno"
  },
  {
   "id": "q6",
   "label": "Are archived records stored securely?",
   "kind": "yesno"
  }
 ]
};
