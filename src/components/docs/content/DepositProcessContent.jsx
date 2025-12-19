import React from "react";

const DepositProcessContent = ({ isDarkMode }) => {
  return (
    <div className="prose max-w-none">
      <h1
        className={`text-3xl font-bold mb-6 ${isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
          }`}
      >
        Process of Deposit and Withdrawal
      </h1>

      <div className="space-y-8">
        <section>
          <h2
            className={`text-2xl font-semibold mb-4 ${isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
              }`}
          >
            How are deposits made?
          </h2>
          <p
            className={`text-base leading-relaxed mb-4 ${isDarkMode ? "text-zinc-300" : "text-zinc-600"
              }`}
          >
            Soundbet's deposit process is designed to be simple and secure,
            allowing users to fund their accounts with cryptocurrency tokens
            like USDC. Below is a step-by-step guide to depositing funds,
            including special instructions for bulk deposits exceeding $25,000.
          </p>

          <div className="space-y-4">
            <div
              className={`p-4 rounded-lg ${isDarkMode
                  ? "bg-zinc-800 border border-zinc-700"
                  : "bg-gray-50 border border-gray-200"
                }`}
            >
              <h3
                className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
                  }`}
              >
                Select the Gateway
              </h3>
              <p
                className={`text-sm ${isDarkMode ? "text-zinc-300" : "text-zinc-600"
                  }`}
              >
                Navigate to the "Deposit" section in your Soundbet account
                dashboard. Choose the deposit gateway, which is the platform's
                secure interface for handling crypto transactions. This ensures
                your funds are processed safely within Soundbet's centralized
                system.
              </p>
            </div>

            <div
              className={`p-4 rounded-lg ${isDarkMode
                  ? "bg-zinc-800 border border-zinc-700"
                  : "bg-gray-50 border border-gray-200"
                }`}
            >
              <h3
                className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
                  }`}
              >
                Select Token or Click Transfer Securely
              </h3>
              <p
                className={`text-sm ${isDarkMode ? "text-zinc-300" : "text-zinc-600"
                  }`}
              >
                Choose the cryptocurrency token you wish to deposit, such as
                USDC, from the list of supported tokens. If no token selection
                is required, click the "Transfer Securely" button to proceed.
                This step confirms your intent to fund your account and directs
                you to the next stage of the deposit process.
              </p>
            </div>

            <div
              className={`p-4 rounded-lg ${isDarkMode
                  ? "bg-zinc-800 border border-zinc-700"
                  : "bg-gray-50 border border-gray-200"
                }`}
            >
              <h3
                className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
                  }`}
              >
                Attach Wallet or Copy Wallet Address
              </h3>
              <p
                className={`text-sm ${isDarkMode ? "text-zinc-300" : "text-zinc-600"
                  }`}
              >
                You have two options: connect a compatible wallet (e.g.,
                MetaMask) by selecting it and authorizing the connection, or
                copy the unique Soundbet wallet address displayed on your
                dashboard. The wallet address option allows you to send funds
                manually from any external wallet, offering flexibility for
                users who prefer not to link wallets directly.
              </p>
            </div>

            <div
              className={`p-4 rounded-lg ${isDarkMode
                  ? "bg-zinc-800 border border-zinc-700"
                  : "bg-gray-50 border border-gray-200"
                }`}
            >
              <h3
                className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
                  }`}
              >
                Pay Securely Through Your Wallet
              </h3>
              <p
                className={`text-sm ${isDarkMode ? "text-zinc-300" : "text-zinc-600"
                  }`}
              >
                If using a connected wallet like MetaMask, confirm the
                transaction details (amount and token) and approve the payment.
                For manual transfers, send the desired amount to the copied
                Soundbet wallet address. For security, we recommend detaching your
                wallet after use or using a separate wallet with a low balance
                to minimize risks.
              </p>
            </div>
          </div>

          <div
            className={`mt-6 p-4 rounded-lg ${isDarkMode
                ? "bg-yellow-900/20 border border-yellow-700"
                : "bg-yellow-50 border border-yellow-200"
              }`}
          >
            <h3
              className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-yellow-300" : "text-yellow-800"
                }`}
            >
              Bulk Deposits (Over $25,000)
            </h3>
            <p
              className={`text-sm mb-2 ${isDarkMode ? "text-yellow-200" : "text-yellow-700"
                }`}
            >
              For deposits exceeding $25,000, use main bridges: Polygon Bridge
              or Arbitrum Bridge to send USDC directly. Contact Soundbet support
              for confirmation and processing assistance. A designated wallet
              address shall be provided to you, reach out to us at
              deposit@Soundbet.com. Verify the address carefully to prevent errors.
              Contact Soundbet support for assistance with processing the bulk
              deposits.
            </p>
            <p
              className={`text-sm font-semibold ${isDarkMode ? "text-yellow-200" : "text-yellow-700"
                }`}
            >
              Warning: Soundbet is not affiliated with these bridge platforms, and
              users assume responsibility for any risks associated with their
              use.
            </p>
          </div>
        </section>

        <section>
          <h2
            className={`text-2xl font-semibold mb-4 ${isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
              }`}
          >
            How are withdrawals requested?
          </h2>
          <p
            className={`text-base leading-relaxed mb-4 ${isDarkMode ? "text-zinc-300" : "text-zinc-600"
              }`}
          >
            Withdrawing funds from Soundbet is a secure and efficient process
            designed for user convenience. To initiate a withdrawal, navigate to
            the "Withdrawal" section in your account dashboard, specify the
            amount in USDC, and provide your external cryptocurrency wallet
            address. When you choose the instant option, the gas fee (as
            applicable) and payment platform fee (0.5% of gross withdrawal
            request) is levied on the user.
          </p>

          <p
            className={`text-base leading-relaxed ${isDarkMode ? "text-zinc-300" : "text-zinc-600"
              }`}
          >
            In the case of Mass payouts, Soundbet queues all withdrawal requests
            and processes them twice daily in UTC timezone: at 1000 hours, 1600
            hours. This batch processing ensures timely and organized transfers
            while maintaining security with a low cost due to mass payments.
            Once processed, funds are sent to your designated wallet, typically
            arriving within minutes, depending on blockchain confirmation times.
            Always double-check your wallet address to avoid errors. When you
            choose the mass payout option, the gas fee is paid by Soundbet, however
            payment platform fee (0.5% of gross withdrawal request) is still
            levied on the user.
          </p>
        </section>
      </div>
    </div>
  );
};

export default DepositProcessContent;
