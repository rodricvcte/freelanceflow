-- Rename Pro template nichos to shorter, cleaner labels
UPDATE proposals
SET template_nicho = 'Gestão de Tráfego'
WHERE is_template = true AND template_nicho = 'Gestor de Tráfego Pago';

UPDATE proposals
SET template_nicho = 'Design'
WHERE is_template = true AND template_nicho = 'Designer Freelancer';

UPDATE proposals
SET template_nicho = 'Desenvolvimento'
WHERE is_template = true AND template_nicho = 'Dev Freelancer';

UPDATE proposals
SET template_nicho = 'Copywriting'
WHERE is_template = true AND template_nicho = 'Copywriter';
