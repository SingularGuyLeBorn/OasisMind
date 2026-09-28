import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import {
	chmod,
	copyFile,
	lstat,
	mkdir,
	mkdtemp,
	rm,
	writeFile,
} from "node:fs/promises";
import { createServer, type Server, type Socket } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { runInNewContext } from "node:vm";
import {
	CompanionSidecarToolCallSchema,
	RemoteSidecarToolCallSchema,
	SIDECAR_PROTOCOL_MAJOR,
	SidecarRequestSchema,
	type CompanionSidecarToolCall,
	type RemoteSidecarToolCall,
	type SidecarRequest,
} from "@anysphere/computer-use/protocol";
import { type Context, createContext } from "@anysphere/context";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
	MAC_PROCESS_PATH_SCRIPT,
	MacComputerUseRPCClient,
} from "./sidecar-client";
import {
	SIDECAR_INSTALL_LOCK_NAME,
	withSidecarInstallLock,
} from "../common/sidecar-install-lock";
import { MacRPCProtocol, MacRPCProtocolError } from "./rpc-codec";
import {
	conversationIdKey,
	type ComputerUseClick,
} from "../types";

const successfulResult = {
	message: "ok",
	isError: false,
};
const UUID_V4 =
	/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TEST_SESSION_ID = "11111111-1111-4111-8111-111111111111";
const START_RESPONSE = `${JSON.stringify({
	id: 1,
	ok: true,
	sessionId: TEST_SESSION_ID,
})}\n`;

/** Contract-valid service.json content with test-supplied fields on top. */
function serviceStateJson(fields: Record<string, unknown>): string {
	return JSON.stringify({
		pid: 4242,
		transport: "unix-json-rpc",
		updatedAt: 0,
		protocolMajor: SIDECAR_PROTOCOL_MAJOR,
		...fields,
	});
}

const clickArgs = {
	coordinate: { x: 10, y: 20 },
	button: "left",
	count: 1,
} satisfies ComputerUseClick;

interface SocketFixture {
	server: Server;
	socketPath: string;
}

interface WireContractCase {
	description: string;
	invoke: (client: MacComputerUseRPCClient, ctx: Context) => Promise<unknown>;
	name: string;
	arguments: Record<string, unknown>;
	requiresSession?: true;
}

const wireContractCases: WireContractCase[] = [
	{
		description: "screenshot",
		invoke: (client, ctx) => client.screenshot(ctx),
		name: "computer_use_screenshot",
		arguments: {},
	},
	{
		description: "click",
		invoke: (client, ctx) =>
			client.click(ctx, {
				coordinate: { x: 11, y: 12 },
				button: "right",
				count: 2,
			}),
		name: "computer_use_click",
		arguments: {
			x: 11,
			y: 12,
			button: "right",
			count: 2,
		},
		requiresSession: true,
	},
	{
		description: "scroll",
		invoke: (client, ctx) =>
			client.scroll(ctx, {
				coordinate: { x: 21, y: 22 },
				direction: "left",
				amount: 4,
			}),
		name: "computer_use_scroll",
		arguments: {
			x: 21,
			y: 22,
			direction: "left",
			amount: 4,
		},
		requiresSession: true,
	},
	{
		description: "move",
		invoke: (client, ctx) =>
			client.move(ctx, { x: 31, y: 32 }),
		name: "computer_use_mouse_move",
		arguments: { x: 31, y: 32 },
		requiresSession: true,
	},
	{
		description: "drag",
		invoke: (client, ctx) =>
			client.drag(ctx, {
				button: "left",
				path: [
					{ x: 41, y: 42 },
					{ x: 43, y: 44 },
				],
			}),
		name: "computer_use_drag",
		arguments: {
			button: "left",
			path: [
				{ x: 41, y: 42 },
				{ x: 43, y: 44 },
			],
		},
		requiresSession: true,
	},
	{
		description: "type text",
		invoke: (client, ctx) =>
			client.typeText(ctx, "hello"),
		name: "computer_use_typing",
		arguments: { value: "hello" },
		requiresSession: true,
	},
	{
		description: "press key",
		invoke: (client, ctx) =>
			client.pressKey(ctx, "Return"),
		name: "computer_use_press_key",
		arguments: { key: "Return" },
		requiresSession: true,
	},
];

async function listen(
	directory: string,
	onConnection: (socket: Socket) => void
): Promise<SocketFixture> {
	const socketPath = join(directory, `rpc-${crypto.randomUUID()}.sock`);
	const server = createServer(onConnection);
	await new Promise<void>((resolve, reject) => {
		server.once("error", reject);
		server.listen(socketPath, resolve);
	});
	return { server, socketPath };
}

async function closeServer(server: Server): Promise<void> {
	await new Promise<void>(resolve => server.close(() => resolve()));
}

function readRequest(
	socket: Socket,
	response: (socket: Socket, requestLine: string) => void
): void {
	let request = "";
	const onData = (chunk: Buffer): void => {
		request += chunk.toString("utf8");
		const newlineIndex = request.indexOf("\n");
		if (newlineIndex >= 0) {
			socket.off("data", onData);
			response(socket, request.slice(0, newlineIndex));
		}
	};
	socket.on("data", onData);
}

/** Every captured request must validate against the shared wire contract. */
function parseCapturedRequest(requestLine: string): RemoteSidecarToolCall {
	return RemoteSidecarToolCallSchema.parse(JSON.parse(requestLine));
}

function parseRequest(requestLine: string): SidecarRequest {
	return SidecarRequestSchema.parse(JSON.parse(requestLine));
}

describe("macOS process path script", () => {
	it("decodes the returned bytes without importing libproc", () => {
		const reportedPath =
			"/Users/arthur.lee/.cursor/computer-use-sidecar/55a8/Cursor Computer Üse.app/Contents/MacOS/CUCursorService";
		const imports: string[] = [];
		const dollar = {
			NSMutableData: {
				dataWithLength: (length: number) => ({
					mutableBytes: new Uint8Array(length),
				}),
			},
			NSData: {
				dataWithBytesLength: (buffer: Uint8Array, length: number) =>
					buffer.slice(0, length),
			},
			NSString: {
				alloc: {
					initWithDataEncoding: (bytes: Uint8Array) =>
						Buffer.from(bytes).toString("utf8"),
				},
			},
			NSUTF8StringEncoding: 4,
			proc_pidpath: (
				_pid: number,
				_buffer: Uint8Array,
				_length: number
			): number => 0,
		};
		const ObjC = {
			import: (framework: string): void => {
				imports.push(framework);
				if (framework !== "Foundation") {
					throw new Error(`invalid framework: ${framework}`);
				}
			},
			bindFunction: (): void => {
				dollar.proc_pidpath = (_pid, buffer) => {
					const bytes = Buffer.from(reportedPath, "utf8");
					buffer.set(bytes);
					return bytes.length;
				};
			},
			unwrap: (value: unknown): unknown => value,
		};

		expect(
			runInNewContext(`${MAC_PROCESS_PATH_SCRIPT}; run(["42"])`, {
				ObjC,
				$: dollar,
			})
		).toBe(reportedPath);
		expect(imports).toEqual(["Foundation"]);
	});
});

describe.sequential("MacComputerUseRPCClient", () => {
	let directory: string;
	let executableDirectories: string[];
	let servers: Server[];

	beforeEach(async () => {
		directory = await mkdtemp(join(tmpdir(), "sidecar-client-"));
		executableDirectories = [];
		servers = [];
		process.env.CUA_APP_SUPPORT_DIR = directory;
	});

	afterEach(async () => {
		delete process.env.CUA_APP_SUPPORT_DIR;
		delete process.env.CUA_SERVICE_APP;
		for (const server of servers) {
			await closeServer(server);
		}
		await rm(directory, { recursive: true, force: true });
		for (const executableDirectory of executableDirectories) {
			await rm(executableDirectory, { recursive: true, force: true });
		}
	});

	async function useSocket(
		onRequest: (socket: Socket, requestLine: string) => void
	): Promise<string> {
		const fixture = await listen(directory, socket =>
			readRequest(socket, onRequest)
		);
		servers.push(fixture.server);
		await writeFile(
			join(directory, "service.json"),
			serviceStateJson({ rpcSocketPath: fixture.socketPath })
		);
		return fixture.socketPath;
	}

	/**
	 * Fake helper app: env-override resolvable, with a CUCursorService
	 * "binary" that rewrites service.json like the real
	 * sidecar's startup does. Lives under node_modules/.cache, not tmpdir:
	 * CI mounts tmpdir noexec (spawn EACCES), while node_modules provably
	 * allows exec because vitest itself runs from node_modules/.bin.
	 */
	async function useFakeHelperApp(options: {
		launchSocketPath?: string;
		launchDelaySeconds?: number;
	} = {}): Promise<(appPath: string) => void> {
		const cacheRoot = join(process.cwd(), "node_modules", ".cache");
		await mkdir(cacheRoot, { recursive: true });
		const executableDirectory = await mkdtemp(join(cacheRoot, "cua-helper-"));
		executableDirectories.push(executableDirectory);
		const appPath = join(executableDirectory, "Cursor Computer Use.app");
		await mkdir(join(appPath, "Contents", "MacOS"), { recursive: true });
		const executablePath = join(
			appPath,
			"Contents",
			"MacOS",
			"CUCursorService"
		);
		const launchState = serviceStateJson({
			rpcSocketPath: options.launchSocketPath ?? join(directory, "none.sock"),
		});
		await writeFile(
			executablePath,
			`#!/bin/sh\n${options.launchDelaySeconds === undefined ? "" : `sleep ${options.launchDelaySeconds}\n`}printf '%s' '${launchState}' > '${join(directory, "service.json")}'\n`
		);
		await chmod(executablePath, 0o755);
		process.env.CUA_SERVICE_APP = appPath;
		return () => {
			spawn(executablePath, [], {
				detached: true,
				stdio: "ignore",
			}).unref();
		};
	}

	/** A stand-in running helper process that restart admission can inspect. */
	async function spawnHelperProcess(processName = "CUCursorService"): Promise<{
		pid: number;
		exited: Promise<string | null>;
		kill: () => void;
		appPath: string;
	}> {
		const cacheRoot = join(process.cwd(), "node_modules", ".cache");
		await mkdir(cacheRoot, { recursive: true });
		const executableDirectory = await mkdtemp(join(cacheRoot, "cua-process-"));
		executableDirectories.push(executableDirectory);
		const appPath = join(executableDirectory, "Cursor Computer Use.app");
		const macOSDirectory = join(appPath, "Contents", "MacOS");
		await mkdir(macOSDirectory, { recursive: true });
		await writeFile(
			join(appPath, "Contents", "Info.plist"),
			"<plist><dict><key>CFBundleShortVersionString</key><string>1.0.0</string></dict></plist>"
		);
		const executablePath = join(macOSDirectory, processName);
		await copyFile("/bin/sleep", executablePath);
		await chmod(executablePath, 0o755);
		process.env.CUA_SERVICE_APP = appPath;
		const child = spawn(executablePath, ["30"], { stdio: "ignore" });
		const exited = new Promise<string | null>(resolve => {
			child.once("exit", (_code, signal) => resolve(signal));
		});
		if (child.pid === undefined) {
			throw new Error("failed to spawn the helper stand-in");
		}
		return {
			pid: child.pid,
			exited,
			kill: () => child.kill("SIGKILL"),
			appPath,
		};
	}

	it("decodes a response fragmented across socket chunks", async () => {
		await useSocket(connection => {
			connection.write('{"id":1,"result":{"message":"');
			connection.end('ok","isError":false}}\n');
		});

		await expect(
			new MacComputerUseRPCClient("remote").screenshot(createContext())
		).resolves.toEqual(successfulResult);
	});

	it("uses the first complete frame when multiple frames arrive together", async () => {
		await useSocket(connection => {
			connection.end(
				`${JSON.stringify({ id: 1, result: successfulResult })}\nnot-json\n`
			);
		});

		await expect(
			new MacComputerUseRPCClient("remote").screenshot(createContext())
		).resolves.toEqual(successfulResult);
	});

	it.each(
		wireContractCases
	)("maps the $description method to its exact wire contract", async testCase => {
		let capturedRequest: RemoteSidecarToolCall | undefined;
		await useSocket((connection, requestLine) => {
			if (parseRequest(requestLine).method === "control/start") {
				connection.end(START_RESPONSE);
				return;
			}
			capturedRequest = parseCapturedRequest(requestLine);
			connection.end(
				`${JSON.stringify({ id: 1, result: successfulResult })}\n`
			);
		});

		const client = new MacComputerUseRPCClient("remote");
		if (testCase.requiresSession) {
			await client.startControl(createContext());
		}
		await testCase.invoke(client, createContext());

		expect(capturedRequest).toBeDefined();
		expect({
			name: capturedRequest?.name,
			arguments: capturedRequest?.arguments,
			mode: capturedRequest?.mode,
		}).toEqual({
			name: testCase.name,
			arguments: testCase.arguments,
			mode: "remote",
		});
		expect(
			capturedRequest !== undefined && "sessionId" in capturedRequest
		).toBe(testCase.requiresSession === true);
		if (capturedRequest !== undefined && "sessionId" in capturedRequest) {
			expect(capturedRequest.sessionId).toBe(TEST_SESSION_ID);
		}
		expect(capturedRequest?.requestID).toMatch(UUID_V4);
		expect(capturedRequest?.timeoutSeconds).toBeGreaterThan(0);
		expect(capturedRequest?.deadlineEpochSeconds).toBeGreaterThan(0);
	});

	it("reads permissions passively and reports the snapshot", async () => {
		let capturedMethod: string | undefined;
		const observed: unknown[] = [];
		const ready = await listen(directory, socket => {
			readRequest(socket, (connection, requestLine) => {
				if (parseRequest(requestLine).method === "ping") {
					connection.end('{"id":1,"ok":true}\n');
					return;
				}
				capturedMethod = parseCapturedRequest(requestLine).method;
				connection.end(
					`${JSON.stringify({
						id: 1,
						result: {
							message: "permissions",
							isError: false,
							structuredContent: {
								tool: "computer_use_check_permissions",
								status: "ok",
								message: "permissions",
								permissions: {
									accessibilityTrusted: false,
									screenRecordingGranted: true,
									openedSettings: false,
									missingPermissions: ["accessibility"],
								},
							},
						},
					})}\n`
				);
			});
		});
		servers.push(ready.server);
		const baseLaunch = await useFakeHelperApp({
			launchSocketPath: ready.socketPath,
		});
		let launches = 0;
		const client = new MacComputerUseRPCClient(
			"remote",
			appPath => {
				launches += 1;
				baseLaunch(appPath);
			},
			status => {
				observed.push(status);
			}
		);

		const result = await client.checkPermissions(createContext());

		expect(launches).toBe(1);
		expect(capturedMethod).toBe("tools/call");
		expect(observed).toEqual([
			{
				accessibilityTrusted: false,
				screenRecordingGranted: true,
			},
		]);
		expect(result.structuredContent?.permissions).toMatchObject({
			accessibilityTrusted: false,
			screenRecordingGranted: true,
			openedSettings: false,
			missingPermissions: ["accessibility"],
		});
	});

	it("does not replace a running helper during a passive status read", async () => {
		const live = await listen(directory, socket => {
			readRequest(socket, connection => {
				connection.end(
					'{"id":1,"permissionStatus":{"accessibilityTrusted":false,"screenRecordingGranted":false}}\n'
				);
			});
		});
		servers.push(live.server);
		const running = await spawnHelperProcess();
		try {
			await writeFile(
				join(directory, "service.json"),
				serviceStateJson({
					rpcSocketPath: live.socketPath,
					pid: running.pid,
				})
			);

			await new MacComputerUseRPCClient("remote").getPermissionStatus();

			expect(() => process.kill(running.pid, 0)).not.toThrow();
		} finally {
			running.kill();
		}
	});

	it("preflights a healthy granted sidecar without restarting it", async () => {
		await useSocket(connection => {
			connection.end(
				'{"id":1,"permissionStatus":{"accessibilityTrusted":true,"screenRecordingGranted":true}}\n'
			);
		});
		let launches = 0;

		await new MacComputerUseRPCClient("remote", () => {
			launches += 1;
		}).preflight(createContext());

		expect(launches).toBe(0);
	});

	// The first granted preflight opens a permissions/status RPC and caches the
	// grant for the helper session, so the next preflights are answered without
	// another probe: N preflighted tool calls now cost one probe, not N.
	it("caches a granted preflight so later preflights send no probe", async () => {
		let probes = 0;
		await useSocket((connection, requestLine) => {
			if (parseRequest(requestLine).method === "permissions/status") {
				probes += 1;
			}
			connection.end(
				'{"id":1,"permissionStatus":{"accessibilityTrusted":true,"screenRecordingGranted":true}}\n'
			);
		});
		const client = new MacComputerUseRPCClient("remote");

		for (let i = 0; i < 3; i++) {
			await client.preflight(createContext());
		}

		expect(probes).toBe(1);
	});

	it("keeps a passive status read from launching a missing sidecar", async () => {
		let launches = 0;
		const client = new MacComputerUseRPCClient("remote", () => {
			launches += 1;
		});

		await expect(client.getPermissionStatus()).rejects.toThrow(
			"sidecar is not running"
		);
		expect(launches).toBe(0);
	});

	it.each([
		{ name: "missing rendezvous", stale: false },
		{ name: "dead stale rendezvous", stale: true },
	])("launches the exact selected helper after a $name", async ({ stale }) => {
		const ready = await listen(directory, socket => {
			readRequest(socket, (connection, requestLine) => {
				connection.end(
					parseRequest(requestLine).method === "ping"
						? '{"id":1,"ok":true}\n'
						: '{"id":1,"permissionStatus":{"accessibilityTrusted":true,"screenRecordingGranted":true}}\n'
				);
			});
		});
		servers.push(ready.server);
		if (stale) {
			await writeFile(
				join(directory, "service.json"),
				serviceStateJson({
					pid: 999_999,
					rpcSocketPath: join(directory, "stale.sock"),
					updatedAt: 0,
				})
			);
		}
		const running = await spawnHelperProcess();
		try {
			const launchedPaths: string[] = [];
			const publishState = (): void =>
				writeFileSync(
					join(directory, "service.json"),
					serviceStateJson({
						pid: running.pid,
						rpcSocketPath: ready.socketPath,
						updatedAt: 1,
					})
				);
			const client = new MacComputerUseRPCClient(
				"remote",
				appPath => {
					launchedPaths.push(appPath);
					stale ? setTimeout(publishState, 25) : publishState();
				},
				undefined,
				{ appPath: running.appPath, source: "download-cache" }
			);
			process.env.CUA_SERVICE_APP = "/changed-after-selection.app";

			await client.getOrLaunchPermissionStatus(createContext());

			expect(launchedPaths).toEqual([running.appPath]);
		} finally {
			running.kill();
		}
	});

	it("excludes installation until downloaded-helper launch is identity-verified", async () => {
		const running = await spawnHelperProcess();
		const ready = await listen(directory, socket => {
			readRequest(socket, (connection, requestLine) => {
				connection.end(
					parseRequest(requestLine).method === "ping"
						? '{"id":1,"ok":true}\n'
						: '{"id":1,"permissionStatus":{"accessibilityTrusted":true,"screenRecordingGranted":true}}\n'
				);
			});
		});
		servers.push(ready.server);
		let markLaunchStarted = (): void => {
			throw new Error("launch did not start");
		};
		const launchStarted = new Promise<void>(resolve => {
			markLaunchStarted = resolve;
		});
		const client = new MacComputerUseRPCClient(
			"remote",
			markLaunchStarted,
			undefined,
			{ appPath: running.appPath, source: "download-cache" }
		);
		try {
			const status = client.getOrLaunchPermissionStatus(createContext());
			await launchStarted;
			let installerEntered = false;
			await expect(
				withSidecarInstallLock(dirname(running.appPath), async () => {
					installerEntered = true;
				})
			).rejects.toThrow("Another Cursor window is installing");
			expect(installerEntered).toBe(false);

			await writeFile(
				join(directory, "service.json"),
				serviceStateJson({
					pid: running.pid,
					rpcSocketPath: ready.socketPath,
					updatedAt: 1,
				})
			);
			await status;
			await withSidecarInstallLock(dirname(running.appPath), async () => {
				installerEntered = true;
			});
			expect(installerEntered).toBe(true);
		} finally {
			running.kill();
		}
	});

	it("leaves a stale lock untouched for concurrent callers", async () => {
		const installRoot = join(directory, "install-root");
		const lockPath = join(installRoot, SIDECAR_INSTALL_LOCK_NAME);
		await mkdir(lockPath, { recursive: true });
		const results = await Promise.allSettled(
			[1, 2].map(() =>
				withSidecarInstallLock(installRoot, async () => undefined)
			)
		);

		expect(results.every(result => result.status === "rejected")).toBe(true);
		expect((await lstat(lockPath)).isDirectory()).toBe(true);
	});

	it("uses the identity-verified socket when service state changes after ping", async () => {
		let rogueRequests = 0;
		const rogue = await listen(directory, socket => {
			rogueRequests += 1;
			socket.end(
				'{"id":1,"permissionStatus":{"accessibilityTrusted":false,"screenRecordingGranted":false}}\n'
			);
		});
		servers.push(rogue.server);
		const running = await spawnHelperProcess();
		const selected = await listen(directory, socket => {
			readRequest(socket, (connection, requestLine) => {
				if (parseRequest(requestLine).method === "ping") {
					writeFileSync(
						join(directory, "service.json"),
						serviceStateJson({
							pid: 999_999,
							rpcSocketPath: rogue.socketPath,
							updatedAt: 2,
						})
					);
					connection.end('{"id":1,"ok":true}\n');
					return;
				}
				connection.end(
					'{"id":1,"permissionStatus":{"accessibilityTrusted":true,"screenRecordingGranted":false}}\n'
				);
			});
		});
		servers.push(selected.server);
		try {
			const client = new MacComputerUseRPCClient(
				"remote",
				() => {
					writeFileSync(
						join(directory, "service.json"),
						serviceStateJson({
							pid: running.pid,
							rpcSocketPath: selected.socketPath,
							updatedAt: 1,
						})
					);
				},
				undefined,
				{ appPath: running.appPath, source: "download-cache" }
			);

			await expect(
				client.getOrLaunchPermissionStatus(createContext())
			).resolves.toEqual({
				accessibilityTrusted: true,
				screenRecordingGranted: false,
			});
			expect(rogueRequests).toBe(0);
		} finally {
			running.kill();
		}
	});

	it("rejects passive status from a helper outside the selected app", async () => {
		const unexpected = await spawnHelperProcess();
		const selected = await spawnHelperProcess();
		try {
			await writeFile(
				join(directory, "service.json"),
				serviceStateJson({
					pid: unexpected.pid,
					rpcSocketPath: join(directory, "unexpected.sock"),
				})
			);
			const client = new MacComputerUseRPCClient(
				"remote",
				undefined,
				undefined,
				{ appPath: selected.appPath, source: "download-cache" }
			);

			await expect(client.getPermissionStatus()).rejects.toThrow(
				"unexpected app path"
			);
		} finally {
			unexpected.kill();
			selected.kill();
		}
	});

	it.each([
		{
			name: "canonical executable from another app",
			processName: "CUCursorService",
			sameApp: false,
		},
		{
			name: "legacy CUService from the selected downloaded app",
			processName: "CUService",
			sameApp: true,
		},
	])("refuses a $name", async ({ processName, sameApp }) => {
		const running = await spawnHelperProcess(processName);
		try {
			await writeFile(
				join(directory, "service.json"),
				serviceStateJson({
					rpcSocketPath: join(directory, "untrusted.sock"),
					pid: running.pid,
				})
			);
			let launches = 0;
			const client = new MacComputerUseRPCClient(
				"remote",
				() => {
					launches += 1;
				},
				undefined,
				{
					appPath: sameApp
						? running.appPath
						: join(directory, "selected.app"),
					source: "download-cache",
				}
			);

			await expect(client.screenshot(createContext())).rejects.toThrow(
				"running from a different app path"
			);
			expect(launches).toBe(0);
		} finally {
			running.kill();
		}
	});

	it("restarts once when the first preflight is missing and proceeds when fresh status grants", async () => {
		let initialReads = 0;
		await useSocket(connection => {
			initialReads += 1;
			connection.end(
				'{"id":1,"permissionStatus":{"accessibilityTrusted":false,"screenRecordingGranted":true}}\n'
			);
		});
		const ready = await listen(directory, socket => {
			readRequest(socket, (connection, requestLine) => {
				const request = JSON.parse(requestLine) as { method?: string };
				connection.end(
					request.method === "ping"
						? '{"id":1,"ok":true}\n'
						: '{"id":1,"permissionStatus":{"accessibilityTrusted":true,"screenRecordingGranted":true}}\n'
				);
			});
		});
		servers.push(ready.server);
		const baseLaunch = await useFakeHelperApp({
			launchSocketPath: ready.socketPath,
			launchDelaySeconds: 0.1,
		});
		let launches = 0;
		const client = new MacComputerUseRPCClient("remote", appPath => {
			launches += 1;
			baseLaunch(appPath);
		});

		await client.preflight(createContext());

		expect(initialReads).toBe(1);
		expect(launches).toBe(1);
	});

	it("restarts and routes true missing once, then blocks repeated preflights", async () => {
		let initialReads = 0;
		await useSocket(connection => {
			initialReads += 1;
			connection.end(
				'{"id":1,"permissionStatus":{"accessibilityTrusted":false,"screenRecordingGranted":true}}\n'
			);
		});
		const readyMethods: string[] = [];
		const ready = await listen(directory, socket => {
			readRequest(socket, (connection, requestLine) => {
				const request = JSON.parse(requestLine) as { method?: string };
				readyMethods.push(request.method ?? "");
				connection.end(
					request.method === "ping"
						? '{"id":1,"ok":true}\n'
						: '{"id":1,"permissionStatus":{"accessibilityTrusted":false,"screenRecordingGranted":true}}\n'
				);
			});
		});
		servers.push(ready.server);
		const baseLaunch = await useFakeHelperApp({
			launchSocketPath: ready.socketPath,
			launchDelaySeconds: 0.1,
		});
		const statuses: unknown[] = [];
		let launches = 0;
		const client = new MacComputerUseRPCClient(
			"remote",
			appPath => {
				launches += 1;
				baseLaunch(appPath);
			},
			status => {
				statuses.push(status);
			}
		);

		await expect(client.preflight(createContext())).rejects.toThrow(
			"requires Accessibility and Screen Recording"
		);
		await expect(client.preflight(createContext())).rejects.toThrow(
			"requires Accessibility and Screen Recording"
		);
		expect(statuses).toHaveLength(1);
		expect(initialReads).toBe(1);
		expect(launches).toBe(1);
		expect(readyMethods).toEqual(["ping", "permissions/status"]);
	});

	it("recognizes a relaunched rendezvous when only its timestamp changes", async () => {
		const methods: string[] = [];
		const ready = await listen(directory, socket => {
			readRequest(socket, (connection, requestLine) => {
				const request = JSON.parse(requestLine) as { method?: string };
				methods.push(request.method ?? "");
				connection.end(
					request.method === "ping"
						? '{"id":1,"ok":true}\n'
						: '{"id":1,"permissionStatus":{"accessibilityTrusted":true,"screenRecordingGranted":true}}\n'
				);
			});
		});
		servers.push(ready.server);
		const pid = 999_999;
		await writeFile(
			join(directory, "service.json"),
			serviceStateJson({
				pid,
				rpcSocketPath: ready.socketPath,
				updatedAt: 0,
			})
		);
		await useFakeHelperApp();
		const client = new MacComputerUseRPCClient("remote", () => {
			writeFileSync(
				join(directory, "service.json"),
				serviceStateJson({
					pid,
					rpcSocketPath: ready.socketPath,
					updatedAt: 1,
				})
			);
		});

		await expect(
			client.restartAndGetPermissionStatus(createContext())
		).resolves.toEqual({
			accessibilityTrusted: true,
			screenRecordingGranted: true,
		});
		expect(methods).toEqual(["ping", "permissions/status"]);
	});

	it("recovers broken rendezvous once across concurrent preflights", async () => {
		const methods: string[] = [];
		const ready = await listen(directory, socket => {
			readRequest(socket, (connection, requestLine) => {
				const request = JSON.parse(requestLine) as { method?: string };
				methods.push(request.method ?? "");
				connection.end(
					request.method === "ping"
						? '{"id":1,"ok":true}\n'
						: '{"id":1,"permissionStatus":{"accessibilityTrusted":true,"screenRecordingGranted":true}}\n'
				);
			});
		});
		servers.push(ready.server);
		await writeFile(
			join(directory, "service.json"),
			serviceStateJson({
				rpcSocketPath: join(directory, "broken.sock"),
				pid: 999_999,
			})
		);
		const baseLaunch = await useFakeHelperApp({
			launchSocketPath: ready.socketPath,
		});
		let launches = 0;
		const client = new MacComputerUseRPCClient("remote", appPath => {
			launches += 1;
			baseLaunch(appPath);
		});

		await Promise.all([
			client.preflight(createContext()),
			client.preflight(createContext()),
		]);

		expect(launches).toBe(1);
		expect(methods).toEqual(["ping", "permissions/status"]);
	});

	// A probe or restart that could not run says nothing about permissions,
	// so it must not latch: the next preflight probes again.
	it("does not latch when recovery fails", async () => {
		const running = await spawnHelperProcess();
		let connections = 0;
		const live = await listen(directory, socket => {
			readRequest(socket, (connection, requestLine) => {
				connections += 1;
				connection.end(
					parseRequest(requestLine).method === "shutdown"
						? '{"id":1,"error":"Computer Use is busy."}\n'
						: "not-json\n"
				);
			});
		});
		servers.push(live.server);
		try {
			await writeFile(
				join(directory, "service.json"),
				serviceStateJson({
					rpcSocketPath: live.socketPath,
					pid: running.pid,
				})
			);
			const client = new MacComputerUseRPCClient("remote");

			await expect(client.preflight(createContext())).rejects.toThrow(
				"Computer Use is busy"
			);
			expect(connections).toBe(2);
			await expect(client.preflight(createContext())).rejects.toThrow(
				"Computer Use is busy"
			);
			expect(connections).toBe(4);
		} finally {
			running.kill();
		}
	});

	// The production race: the harness dispatches computer_check_permissions
	// and an app tool together on a cold client. The permission check launches
	// the helper (no service.json yet); the other call's preflight must wait for
	// that launch rather than read service.json passively, fail, and try to
	// restart while the first call is active.
	it("waits for a launch already in flight instead of failing a cold preflight", async () => {
		const methods: string[] = [];
		const ready = await listen(directory, socket => {
			readRequest(socket, (connection, requestLine) => {
				const method = parseRequest(requestLine).method;
				methods.push(method);
				connection.end(
					method === "ping"
						? '{"id":1,"ok":true}\n'
						: method === "permissions/status"
							? '{"id":1,"permissionStatus":{"accessibilityTrusted":true,"screenRecordingGranted":true}}\n'
							: `${JSON.stringify({
								id: 1,
								result: {
									message: "permissions",
									isError: false,
									structuredContent: {
										tool: "computer_use_check_permissions",
										status: "ok",
										message: "permissions",
										permissions: {
											accessibilityTrusted: true,
											screenRecordingGranted: true,
											openedSettings: false,
											missingPermissions: [],
										},
									},
								},
							})}\n`
				);
			});
		});
		servers.push(ready.server);
		const baseLaunch = await useFakeHelperApp({
			launchSocketPath: ready.socketPath,
			launchDelaySeconds: 0.2,
		});
		let launches = 0;
		const client = new MacComputerUseRPCClient("remote", appPath => {
			launches += 1;
			baseLaunch(appPath);
		});

		const [check] = await Promise.all([
			client.checkPermissions(createContext()),
			client.preflight(createContext()),
		]);

		expect(check.isError).toBe(false);
		expect(launches).toBe(1);
		expect(methods).toEqual(
			expect.arrayContaining(["ping", "tools/call", "permissions/status"])
		);
		expect(methods.filter(method => method === "shutdown")).toEqual([]);
		// Nothing latched: the next gated call probes and passes.
		await expect(client.preflight(createContext())).resolves.toBeUndefined();
	});

	// A preflight that arrives after another call has started the launch joins
	// that exact launch and takes its status as final: the helper is fresh, so
	// a denial must not restart it (launch, shutdown, launch again before the
	// permissions dialog can appear).
	it("takes a denied status from a launch it joined late without restarting", async () => {
		const methods: string[] = [];
		const ready = await listen(directory, socket => {
			readRequest(socket, (connection, requestLine) => {
				const method = parseRequest(requestLine).method;
				methods.push(method);
				connection.end(
					method === "ping"
						? '{"id":1,"ok":true}\n'
						: method === "permissions/status"
							? '{"id":1,"permissionStatus":{"accessibilityTrusted":false,"screenRecordingGranted":true}}\n'
							: `${JSON.stringify({
								id: 1,
								result: {
									message: "permissions",
									isError: false,
									structuredContent: {
										tool: "computer_use_check_permissions",
										status: "ok",
										message: "permissions",
										permissions: {
											accessibilityTrusted: false,
											screenRecordingGranted: true,
											openedSettings: false,
											missingPermissions: ["accessibility"],
										},
									},
								},
							})}\n`
				);
			});
		});
		servers.push(ready.server);
		const baseLaunch = await useFakeHelperApp({
			launchSocketPath: ready.socketPath,
			launchDelaySeconds: 0.2,
		});
		let launches = 0;
		const client = new MacComputerUseRPCClient("remote", appPath => {
			launches += 1;
			baseLaunch(appPath);
		});

		const check = client.checkPermissions(createContext());
		await new Promise(resolve => setTimeout(resolve, 30));
		const preflight = client.preflight(createContext()).then(
			() => "resolved",
			(error: Error) => error.message
		);

		await expect(check).resolves.toMatchObject({ isError: false });
		await expect(preflight).resolves.toContain(
			"requires Accessibility and Screen Recording"
		);
		expect(launches).toBe(1);
		expect(methods.filter(method => method === "shutdown")).toEqual([]);
		expect(methods.filter(method => method === "permissions/status")).toHaveLength(1);
	});

	// Bugbot: a status error right after joining a launch must surface as is,
	// not fall into the restart path and tear down the helper just started.
	it("surfaces a status error from a joined launch without restarting the fresh helper", async () => {
		const methods: string[] = [];
		const ready = await listen(directory, socket => {
			readRequest(socket, (connection, requestLine) => {
				const method = parseRequest(requestLine).method;
				methods.push(method);
				connection.end(
					method === "ping"
						? '{"id":1,"ok":true}\n'
						: method === "permissions/status"
							? '{"id":1,"error":"permission status unavailable"}\n'
							: `${JSON.stringify({ id: 1, result: successfulResult })}\n`
				);
			});
		});
		servers.push(ready.server);
		const baseLaunch = await useFakeHelperApp({
			launchSocketPath: ready.socketPath,
			launchDelaySeconds: 0.2,
		});
		let launches = 0;
		const client = new MacComputerUseRPCClient("remote", appPath => {
			launches += 1;
			baseLaunch(appPath);
		});

		const screenshot = client.screenshot(createContext());
		const preflight = client.preflight(createContext()).then(
			() => "resolved",
			(error: Error) => error.message
		);

		await expect(screenshot).resolves.toEqual(successfulResult);
		await expect(preflight).resolves.toBe("permission status unavailable");
		expect(launches).toBe(1);
		expect(methods.filter(method => method === "shutdown")).toEqual([]);
		expect(methods.filter(method => method === "permissions/status")).toHaveLength(1);
	});

	// A grant cached for the helper session must not skip an in-flight
	// refresh restart: the cache is only dropped once the queued restart
	// begins, so a later preflight would otherwise succeed while the
	// helper is being torn down or about to report a denial.
	it("does not answer a cached grant while a refresh restart is in flight", async () => {
		await useSocket(connection => {
			connection.end(
				'{"id":1,"permissionStatus":{"accessibilityTrusted":true,"screenRecordingGranted":true}}\n'
			);
		});
		const methods: string[] = [];
		const ready = await listen(directory, socket => {
			readRequest(socket, (connection, requestLine) => {
				const method = parseRequest(requestLine).method;
				methods.push(method);
				connection.end(
					method === "ping"
						? '{"id":1,"ok":true}\n'
						: '{"id":1,"permissionStatus":{"accessibilityTrusted":false,"screenRecordingGranted":true}}\n'
				);
			});
		});
		servers.push(ready.server);
		const baseLaunch = await useFakeHelperApp({
			launchSocketPath: ready.socketPath,
			launchDelaySeconds: 0.1,
		});
		let launches = 0;
		const client = new MacComputerUseRPCClient("remote", appPath => {
			launches += 1;
			baseLaunch(appPath);
		});

		await client.preflight(createContext());
		await writeFile(
			join(directory, "service.json"),
			serviceStateJson({
				pid: 999_999,
				rpcSocketPath: join(directory, "stale.sock"),
				updatedAt: 0,
			})
		);

		const refresh = client.refreshPermissionEpisode(createContext());
		const preflight = client.preflight(createContext()).then(
			() => "resolved",
			(error: Error) => error.message
		);

		await expect(refresh).resolves.toEqual({
			accessibilityTrusted: false,
			screenRecordingGranted: true,
		});
		await expect(preflight).resolves.toContain(
			"requires Accessibility and Screen Recording"
		);
		expect(launches).toBe(1);
		expect(methods).toEqual(["ping", "permissions/status"]);
	});

	// A refresh already restarting is the pending preflight's recovery: the
	// preflight consumes that restart's status instead of probing around it,
	// so a denial costs exactly one restart.
	it("consumes a denied refresh restart from a pending preflight with exactly one restart", async () => {
		const methods: string[] = [];
		const ready = await listen(directory, socket => {
			readRequest(socket, (connection, requestLine) => {
				const method = parseRequest(requestLine).method;
				methods.push(method);
				connection.end(
					method === "ping"
						? '{"id":1,"ok":true}\n'
						: '{"id":1,"permissionStatus":{"accessibilityTrusted":false,"screenRecordingGranted":true}}\n'
				);
			});
		});
		servers.push(ready.server);
		await writeFile(
			join(directory, "service.json"),
			serviceStateJson({
				pid: 999_999,
				rpcSocketPath: join(directory, "stale.sock"),
				updatedAt: 0,
			})
		);
		const baseLaunch = await useFakeHelperApp({
			launchSocketPath: ready.socketPath,
			launchDelaySeconds: 0.1,
		});
		let launches = 0;
		const client = new MacComputerUseRPCClient("remote", appPath => {
			launches += 1;
			baseLaunch(appPath);
		});

		const refresh = client.refreshPermissionEpisode(createContext());
		const preflight = client.preflight(createContext()).then(
			() => "resolved",
			(error: Error) => error.message
		);

		await expect(refresh).resolves.toEqual({
			accessibilityTrusted: false,
			screenRecordingGranted: true,
		});
		await expect(preflight).resolves.toContain(
			"requires Accessibility and Screen Recording"
		);
		expect(launches).toBe(1);
		expect(methods).toEqual(["ping", "permissions/status"]);
	});

	// The reverse ordering: a preflight whose recovery restart is already in
	// flight when the refresh arrives shares that restart instead of a second.
	it("shares a preflight's in-flight restart with a refresh that follows it", async () => {
		const ready = await listen(directory, socket => {
			readRequest(socket, (connection, requestLine) => {
				connection.end(
					parseRequest(requestLine).method === "ping"
						? '{"id":1,"ok":true}\n'
						: '{"id":1,"permissionStatus":{"accessibilityTrusted":true,"screenRecordingGranted":true}}\n'
				);
			});
		});
		servers.push(ready.server);
		await writeFile(
			join(directory, "service.json"),
			serviceStateJson({
				pid: 999_999,
				rpcSocketPath: join(directory, "stale.sock"),
				updatedAt: 0,
			})
		);
		const baseLaunch = await useFakeHelperApp({
			launchSocketPath: ready.socketPath,
			launchDelaySeconds: 0.2,
		});
		let launches = 0;
		const client = new MacComputerUseRPCClient("remote", appPath => {
			launches += 1;
			baseLaunch(appPath);
		});

		const preflight = client.preflight(createContext());
		await new Promise(resolve => setTimeout(resolve, 30));
		const refresh = client.refreshPermissionEpisode(createContext());

		await expect(preflight).resolves.toBeUndefined();
		await expect(refresh).resolves.toEqual({
			accessibilityTrusted: true,
			screenRecordingGranted: true,
		});
		expect(launches).toBe(1);
	});

	// With no launch in flight, a cold preflight recovers through the one-shot
	// restart, and a denial from that fresh helper latches without a second
	// restart.
	it("recovers a cold preflight through one restart and latches on its denial", async () => {
		const methods: string[] = [];
		const ready = await listen(directory, socket => {
			readRequest(socket, (connection, requestLine) => {
				const method = parseRequest(requestLine).method;
				methods.push(method);
				connection.end(
					method === "ping"
						? '{"id":1,"ok":true}\n'
						: '{"id":1,"permissionStatus":{"accessibilityTrusted":false,"screenRecordingGranted":true}}\n'
				);
			});
		});
		servers.push(ready.server);
		const baseLaunch = await useFakeHelperApp({ launchSocketPath: ready.socketPath });
		const statuses: unknown[] = [];
		let launches = 0;
		const client = new MacComputerUseRPCClient(
			"remote",
			appPath => {
				launches += 1;
				baseLaunch(appPath);
			},
			status => {
				statuses.push(status);
			}
		);

		await expect(client.preflight(createContext())).rejects.toThrow(
			"requires Accessibility and Screen Recording"
		);

		expect(launches).toBe(1);
		expect(methods).toEqual(["ping", "permissions/status"]);
		expect(statuses).toHaveLength(1);
	});

	// A manual refresh relaunches the helper; a preflight arriving meanwhile
	// must wait for that restart instead of launching a second helper that
	// contends for the rendezvous file.
	it("waits for an in-flight refresh restart instead of launching a second helper", async () => {
		const ready = await listen(directory, socket => {
			readRequest(socket, (connection, requestLine) => {
				connection.end(
					parseRequest(requestLine).method === "ping"
						? '{"id":1,"ok":true}\n'
						: '{"id":1,"permissionStatus":{"accessibilityTrusted":true,"screenRecordingGranted":true}}\n'
				);
			});
		});
		servers.push(ready.server);
		await writeFile(
			join(directory, "service.json"),
			serviceStateJson({
				pid: 999_999,
				rpcSocketPath: join(directory, "stale.sock"),
				updatedAt: 0,
			})
		);
		const running = await spawnHelperProcess();
		try {
			let launches = 0;
			const client = new MacComputerUseRPCClient(
				"remote",
				() => {
					launches += 1;
					setTimeout(
						() =>
							writeFileSync(
								join(directory, "service.json"),
								serviceStateJson({
									pid: running.pid,
									rpcSocketPath: ready.socketPath,
									updatedAt: 1,
								})
							),
						100
					);
				},
				undefined,
				{ appPath: running.appPath, source: "download-cache" }
			);

			const refresh = client.refreshPermissionEpisode(createContext());
			const preflight = client.preflight(createContext());

			await expect(refresh).resolves.toEqual({
				accessibilityTrusted: true,
				screenRecordingGranted: true,
			});
			await expect(preflight).resolves.toBeUndefined();
			expect(launches).toBe(1);
		} finally {
			running.kill();
		}
	});


	it("manual refresh starts one new episode and clears a blocked grant", async () => {
		await useSocket(connection => {
			connection.end(
				'{"id":1,"permissionStatus":{"accessibilityTrusted":false,"screenRecordingGranted":false}}\n'
			);
		});
		const permissionServer = async (
			granted: boolean
		): Promise<SocketFixture> =>
			listen(directory, socket => {
				readRequest(socket, (connection, requestLine) => {
					const request = JSON.parse(requestLine) as { method?: string };
					connection.end(
						request.method === "ping"
							? '{"id":1,"ok":true}\n'
							: `${JSON.stringify({
								id: 1,
								permissionStatus: {
									accessibilityTrusted: granted,
									screenRecordingGranted: granted,
								},
							})}\n`
					);
				});
			});
		const missing = await permissionServer(false);
		const granted = await permissionServer(true);
		servers.push(missing.server, granted.server);
		await useFakeHelperApp();
		let launches = 0;
		const client = new MacComputerUseRPCClient("remote", () => {
			const rpcSocketPath =
				launches === 0 ? missing.socketPath : granted.socketPath;
			launches += 1;
			writeFileSync(
				join(directory, "service.json"),
				serviceStateJson({ rpcSocketPath, pid: 999_998 })
			);
		});

		await expect(client.preflight(createContext())).rejects.toThrow(
			"requires Accessibility and Screen Recording"
		);
		await expect(client.preflight(createContext())).rejects.toThrow(
			"requires Accessibility and Screen Recording"
		);
		await expect(
			client.refreshPermissionEpisode(createContext())
		).resolves.toEqual({
			accessibilityTrusted: true,
			screenRecordingGranted: true,
		});
		await expect(client.preflight(createContext())).resolves.toBeUndefined();

		expect(launches).toBe(2);
	});

	// Once latched, the modal's poll and `computer_check_permissions` are the
	// readers that see a grant made without Open Settings; either must end the
	// blocked episode so the next gated call passes without another restart.
	// The reader's grant is also cached, so that next preflight passes without
	// even reprobing permissions/status.
	for (const reader of [
		{
			name: "status read",
			read: (client: MacComputerUseRPCClient) =>
				client.getOrLaunchPermissionStatus(createContext()),
			wire: "permissions/status",
		},
		{
			name: "permission check",
			read: (client: MacComputerUseRPCClient) =>
				client.checkPermissions(createContext()),
			wire: "tools/call",
		},
	]) {
		it(`a granted ${reader.name} clears a latched episode without a restart`, async () => {
			await useSocket(connection => {
				connection.end(
					'{"id":1,"permissionStatus":{"accessibilityTrusted":false,"screenRecordingGranted":true}}\n'
				);
			});
			let granted = false;
			const methods: string[] = [];
			const ready = await listen(directory, socket => {
				readRequest(socket, (connection, requestLine) => {
					const method = parseRequest(requestLine).method;
					methods.push(method);
					const permissions = {
						accessibilityTrusted: granted,
						screenRecordingGranted: true,
					};
					connection.end(
						method === "ping"
							? '{"id":1,"ok":true}\n'
							: method === "tools/call"
								? `${JSON.stringify({
									id: 1,
									result: {
										message: "permissions",
										isError: false,
										structuredContent: {
											tool: "computer_use_check_permissions",
											status: "ok",
											message: "permissions",
											permissions: {
												...permissions,
												openedSettings: false,
												missingPermissions: [],
											},
										},
									},
								})}\n`
								: `${JSON.stringify({ id: 1, permissionStatus: permissions })}\n`
					);
				});
			});
			servers.push(ready.server);
			const baseLaunch = await useFakeHelperApp({
				launchSocketPath: ready.socketPath,
			});
			let launches = 0;
			const client = new MacComputerUseRPCClient("remote", appPath => {
				launches += 1;
				baseLaunch(appPath);
			});

			await expect(client.preflight(createContext())).rejects.toThrow(
				"requires Accessibility and Screen Recording"
			);
			await expect(client.preflight(createContext())).rejects.toThrow(
				"requires Accessibility and Screen Recording"
			);
			granted = true;
			await reader.read(client);
			await expect(client.preflight(createContext())).resolves.toBeUndefined();

			expect(launches).toBe(1);
			expect(methods).toEqual(["ping", "permissions/status", reader.wire]);
		});
	}

	it("opens only the requested permission settings kind", async () => {
		let capturedRequest: unknown;
		await useSocket((connection, requestLine) => {
			capturedRequest = JSON.parse(requestLine);
			connection.end(
				'{"id":1,"permissionSettings":{"permission":"screenRecording","opened":true}}\n'
			);
		});

		await expect(
			new MacComputerUseRPCClient("remote").openPermissionSettings(
				createContext(),
				"screenRecording"
			)
		).resolves.toEqual({
			permission: "screenRecording",
			opened: true,
		});

		expect(capturedRequest).toMatchObject({
			method: "permissions/open-settings",
			permission: "screenRecording",
		});
	});

	it("surfaces a typed permission navigation failure", async () => {
		await useSocket(connection => {
			connection.end(
				'{"id":1,"permissionSettings":{"permission":"accessibility","opened":false}}\n'
			);
		});

		await expect(
			new MacComputerUseRPCClient("remote").openPermissionSettings(
				createContext(),
				"accessibility"
			)
		).rejects.toThrow("Could not open Accessibility in System Settings.");
	});

	it("sends a unique diagnostic request ID for each tool call", async () => {
		const requestIDs: string[] = [];
		await useSocket((connection, requestLine) => {
			requestIDs.push(parseCapturedRequest(requestLine).requestID ?? "");
			connection.end(
				`${JSON.stringify({ id: 1, result: successfulResult })}\n`
			);
		});
		const client = new MacComputerUseRPCClient("remote");

		await client.screenshot(createContext());
		await client.screenshot(createContext());

		expect(requestIDs).toHaveLength(2);
		expect(new Set(requestIDs).size).toBe(2);
		expect(requestIDs.every(id => /^[0-9a-f-]{36}$/.test(id))).toBe(true);
	});

	it("rejects a response that closes without a newline", async () => {
		await useSocket(connection => {
			connection.end(JSON.stringify({ id: 1, result: successfulResult }));
	