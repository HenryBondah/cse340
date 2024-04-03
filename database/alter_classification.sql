-- Correcting the table alteration statements
ALTER TABLE public.classification
ADD COLUMN IF NOT EXISTS classification_approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS account_id INTEGER,
ADD COLUMN IF NOT EXISTS classification_approval_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Adding the foreign key constraint in a separate statement
ALTER TABLE public.classification
ADD CONSTRAINT fk_account_id FOREIGN KEY (account_id)
REFERENCES public.account (account_id)
ON UPDATE NO ACTION ON DELETE NO ACTION;

-- Correcting the index creation statement
CREATE INDEX IF NOT EXISTS fki_account_id
ON public.classification USING btree (account_id ASC NULLS LAST);
