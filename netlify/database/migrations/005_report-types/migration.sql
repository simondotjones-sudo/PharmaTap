ALTER TABLE reports DROP CONSTRAINT reports_type_check;
ALTER TABLE reports ADD CONSTRAINT reports_type_check CHECK(type IN (
 'Prescription error','Medication error','Near miss','Refusal of supply','Safety concern',
 'Accident or injury','Maintenance','Security incident','Complaint','Medicine quality issue','Other'
));
