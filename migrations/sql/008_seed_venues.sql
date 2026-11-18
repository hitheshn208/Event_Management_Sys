-- Venues offered in the event create/edit forms (public/js/event-create.js)
INSERT INTO venue (block, hall) VALUES
    ('esb', 'esb_seminar_1'),
    ('esb', 'esb_seminar_2'),
    ('des', 'des_hitech_1'),
    ('des', 'des_hitech_2')
ON CONFLICT (block, hall) DO NOTHING;
