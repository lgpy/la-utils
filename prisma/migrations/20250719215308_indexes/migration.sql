-- CreateIndex
CREATE INDEX "account_user_id_index" ON "account"("userId");

-- CreateIndex
CREATE INDEX "session_user_id_index" ON "session"("userId");

-- CreateIndex
CREATE INDEX "session_token_index" ON "session"("token");

-- CreateIndex
CREATE INDEX "user_email_index" ON "user"("email");

-- CreateIndex
CREATE INDEX "verification_identifier_index" ON "verification"("identifier");
