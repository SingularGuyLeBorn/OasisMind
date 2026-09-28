�量批准并执行{selectedList.length ? ` (${selectedList.length})` : ""}
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <LoadingState count={3} />
      ) : !data?.items || data.items.length === 0 ? (
        <EmptyState
          title={statusFilter === "pending" ? "暂无待你点头的事项" : "没有匹配的审批记录"}
          description="危险操作被拦截时会出现在此。挂起期间 Agent 不会跳过执行。"
        />
      ) : (
        <>
          <div className="space-y-4">
            {data.items.map((approval: Approval, idx: number) => (
              <motion.div
                key={approval.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: idx * 0.03, type: "spring", stiffness: 200, damping: 20 },
                }}
                className={cn(
                  "om-card-premium om-lift rounded-2xl",
                  densit